import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database/connection";
import User from "@/lib/database/models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Get the event type
  const eventType = evt.type;

  try {
    await dbConnect();

    switch (eventType) {
      case 'user.created': {
        const { id, email_addresses, username, first_name, last_name, image_url } = evt.data;

        // Create user in MongoDB with full metadata
        await User.create({
          clerkId: id,
          email: email_addresses[0]?.email_address || '',
          username: username,
          firstName: first_name,
          lastName: last_name,
          name: `${first_name || ''} ${last_name || ''}`.trim() || 'User',
          photo: image_url,
          plan: 'free',
          role: 'user',
          isActive: true,
          isSuspended: false,
          lastActive: new Date(),
          metadata: {
            lastLogin: new Date(),
            loginCount: 1,
            signupDate: new Date(),
            ipAddresses: [],
          },
          subscription: {
            plan: 'free',
            status: 'active',
          },
          aiUsage: {
            totalRequests: 0,
            requestsThisMonth: 0,
            estimatedCost: 0,
          },
        });

        return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
      }

      case 'user.updated': {
        const { id, email_addresses, username, first_name, last_name, image_url, public_metadata } = evt.data;

        // Extract role from Clerk's public metadata
        const roleFromClerk = (public_metadata as any)?.role || 'user';

        // Update user in MongoDB (including role from Clerk)
        await User.findOneAndUpdate(
          { clerkId: id },
          {
            email: email_addresses[0]?.email_address,
            username: username,
            firstName: first_name,
            lastName: last_name,
            name: `${first_name || ''} ${last_name || ''}`.trim(),
            photo: image_url,
            role: roleFromClerk, // ← Sync role from Clerk to MongoDB
            lastActive: new Date(),
          }
        );

        return NextResponse.json({ message: 'User updated successfully' }, { status: 200 });
      }

      case 'user.deleted': {
        const { id } = evt.data;

        // Soft delete - mark as inactive instead of deleting
        await User.findOneAndUpdate(
          { clerkId: id },
          { 
            isActive: false,
            isSuspended: true,
          }
        );

        return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
      }

      default:
        return NextResponse.json({ message: 'Event type not handled' }, { status: 200 });
    }
  } catch (error) {
    console.error('[WEBHOOK] ❌ Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

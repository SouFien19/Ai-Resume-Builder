import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getCache, setCache, CacheKeys } from "@/lib/redis";

export async function GET() {
  try {
    // 1. Try to get from Redis cache first
    const cacheKey = CacheKeys.templates.all();
    const cached = await getCache<any[]>(cacheKey);

    if (cached) {
      console.log("[Templates API] ✅ Returned from cache (fast!)");
      return NextResponse.json(cached, {
        headers: {
          "X-Cache": "HIT",
          "X-Cache-Key": cacheKey,
        },
      });
    }

    // 2. Cache miss - fetch from filesystem
    console.log(
      "[Templates API] ⚠️ Cache MISS - fetching from filesystem (slow)"
    );
    const templatesDir = path.join(process.cwd(), "public/templates");
    const jsonDir = path.join(templatesDir, "json");
    const files = await fs.readdir(jsonDir);

    const templates = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(jsonDir, file);
        const content = await fs.readFile(filePath, "utf8");
        const json = JSON.parse(content);
        const name = path.basename(file, ".json");

        // Check if preview files exist
        const pdfPath = path.join(templatesDir, "pdf", `${name}.pdf`);
        const svgPath = path.join(templatesDir, "images", `${name}.svg`);
        const pngPath = path.join(templatesDir, "images", `${name}.png`);
        const webpPath = path.join(templatesDir, "webp", `${name}.webp`);
        const jpgPath = path.join(templatesDir, "jpg", `${name}.jpg`);

        // Try WebP first (optimized), then JPG, then SVG, then PDF, then PNG
        let previewUrl;
        let thumbnail = `/templates/webp/${name}.webp`; // Default to WebP
        try {
          await fs.access(webpPath);
          previewUrl = `/templates/webp/${name}.webp`;
          thumbnail = `/templates/webp/${name}.webp`;
        } catch {
          try {
            await fs.access(jpgPath);
            previewUrl = `/templates/jpg/${name}.jpg`;
            thumbnail = `/templates/jpg/${name}.jpg`;
          } catch {
            try {
              await fs.access(svgPath);
              previewUrl = `/templates/images/${name}.svg`;
              thumbnail = `/templates/images/${name}.svg`;
            } catch {
              try {
                await fs.access(pdfPath);
                previewUrl = `/templates/pdf/${name}.pdf`;
                thumbnail = `/templates/images/placeholder.svg`;
              } catch {
                try {
                  await fs.access(pngPath);
                  previewUrl = `/templates/images/${name}.png`;
                  thumbnail = `/templates/images/${name}.png`;
                } catch {
                  // Use placeholder
                  thumbnail = `/templates/images/placeholder.svg`;
                }
              }
            }
          }
        }

        // Better display names for templates
        const displayNames: Record<string, string> = {
          azurill: "Professional Modern",
          pikachu: "Minimalist Clean",
          gengar: "Creative Bold",
          onyx: "Executive Classic",
          chikorita: "Marketing Dynamic",
          bronzor: "Corporate Classic",
          ditto: "Student Friendly",
          glalie: "Tech Minimal",
          kakuna: "Academic Traditional",
          leafish: "Healthcare Professional",
          nosepass: "Consultant Strategy",
          rhyhorn: "Sales Impact",
        };

        // Categories for templates
        const categories: Record<string, string> = {
          azurill: "professional",
          pikachu: "professional",
          gengar: "creative",
          onyx: "professional",
          chikorita: "creative",
          bronzor: "professional",
          ditto: "modern",
          glalie: "modern",
          kakuna: "professional",
          leafish: "professional",
          nosepass: "professional",
          rhyhorn: "creative",
        };

        // Descriptions for templates
        const descriptions: Record<string, string> = {
          azurill:
            "Clean two-column layout with blue accents, perfect for any profession",
          pikachu: "Minimalist centered design with elegant typography",
          gengar: "Modern creative template with indigo theme",
          onyx: "Classic traditional design for executive positions",
          chikorita: "Vibrant orange theme for marketing and creative roles",
          bronzor: "Premium executive template with stone color scheme",
          ditto: "Student-friendly green design for entry-level positions",
          glalie: "Technical developer template with purple accents",
          kakuna: "Academic research template with brown styling",
          leafish: "Healthcare professional design with teal colors",
          nosepass: "Modern business consultant template in red",
          rhyhorn: "Bold sales-focused template with bright orange",
        };

        return {
          _id: name,
          name:
            displayNames[name] || name.charAt(0).toUpperCase() + name.slice(1),
          thumbnail: thumbnail,
          previewUrl,
          category: categories[name] || "professional",
          description: descriptions[name] || "Professional resume template",
          data: {
            body: {
              fontFamily: json.metadata.typography.font.family,
              fontSize: `${json.metadata.typography.font.size}px`,
              lineHeight: json.metadata.typography.lineHeight,
              color: json.metadata.theme.text,
            },
            headings: {
              fontFamily: json.metadata.typography.font.family,
              textTransform: "none",
            },
            subheadings: {
              fontFamily: json.metadata.typography.font.family,
              textTransform: "uppercase",
            },
            page: {
              background: json.metadata.theme.background,
              margin: `${json.metadata.page.margin}px`,
            },
          },
          layout: json.metadata.layout,
          primary: json.metadata.theme.primary,
        };
      })
    );

    // 3. Store in cache for 24 hours (templates rarely change)
    await setCache(cacheKey, templates, 86400); // 24 hours = 86400 seconds
    console.log("[Templates API] ✅ Cached templates for 24 hours");

    return NextResponse.json(templates, {
      headers: {
        "X-Cache": "MISS",
        "X-Cache-Key": cacheKey,
      },
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { message: "Error fetching templates" },
      { status: 500 }
    );
  }
}

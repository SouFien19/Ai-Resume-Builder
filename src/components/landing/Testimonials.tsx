"use client";

import { motion, Variants } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
	{
		name: "Sarah L.",
		role: "Software Engineer",
		avatar: "https://api.uifaces.co/our-content/donated/xZ4wg2Xj.jpg",
		comment:
			"This tool is a game-changer. The AI suggestions helped me highlight skills I didn't even think to include. I landed my dream job at a FAANG company!",
		rating: 5,
	},
	{
		name: "Michael B.",
		role: "Product Manager",
		avatar: "https://randomuser.me/api/portraits/men/32.jpg",
		comment:
			"As a product manager, I appreciate a well-designed product. This resume builder is intuitive, powerful, and the templates are stunning. Highly recommended.",
		rating: 5,
	},
	{
		name: "Jessica T.",
		role: "UX Designer",
		avatar:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
		comment:
			"I was skeptical about an AI writing my resume, but the results were incredible. It captured my design philosophy perfectly and saved me hours of work.",
		rating: 5,
	},
];

const containerVariants: Variants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.2,
		},
	},
};

const itemVariants: Variants = {
	hidden: { opacity: 0, scale: 0.95 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: {
			duration: 0.5,
			ease: "easeOut",
		},
	},
};

export default function Testimonials() {
	return (
		<section className="py-20 md:py-28 bg-gray-50 dark:bg-gray-900">
			<div className="container mx-auto px-4">
				<div className="max-w-3xl mx-auto text-center mb-12 md:mb-20">
					<Badge variant="secondary" className="mb-4">
						Loved by Professionals
					</Badge>
					<h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 mb-4">
						What Our Users Are Saying
					</h2>
					<p className="text-lg text-gray-600 dark:text-gray-400">
						Real stories from professionals who have supercharged their careers
						with our help.
					</p>
				</div>

				<motion.div
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.2 }}
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
				>
					{testimonials.map((testimonial, index) => (
						<motion.div
							key={index}
							variants={itemVariants}
							whileHover={{
								scale: 1.03,
								y: -5,
								transition: { duration: 0.2 },
							}}
							className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-sm flex flex-col"
						>
							<div className="flex items-center mb-4">
								<Avatar className="h-12 w-12 mr-4">
									<AvatarImage
										src={testimonial.avatar}
										alt={testimonial.name}
									/>
									<AvatarFallback>
										{testimonial.name.charAt(0)}
									</AvatarFallback>
								</Avatar>
								<div>
									<h4 className="font-semibold text-gray-900 dark:text-gray-100">
										{testimonial.name}
									</h4>
									<p className="text-sm text-gray-500 dark:text-gray-400">
										{testimonial.role}
									</p>
								</div>
							</div>
							<div className="flex mb-4">
								{[...Array(testimonial.rating)].map((_, i) => (
									<Star
										key={i}
										className="w-5 h-5 text-yellow-400 fill-current"
									/>
								))}
							</div>
							<Quote className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
							<p className="text-gray-600 dark:text-gray-400 flex-1">
								{testimonial.comment}
							</p>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
}

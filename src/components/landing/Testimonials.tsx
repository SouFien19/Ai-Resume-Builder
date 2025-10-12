"use client";

import { motion, Variants, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const testimonials = [
	{
		name: "Lucas L.",
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
	const [currentIndex, setCurrentIndex] = useState(0);
	const [direction, setDirection] = useState(0);

	// Auto-advance carousel
	useEffect(() => {
		const timer = setInterval(() => {
			setDirection(1);
			setCurrentIndex((prev) => (prev + 1) % testimonials.length);
		}, 5000); // Change every 5 seconds

		return () => clearInterval(timer);
	}, []);

	const nextTestimonial = () => {
		setDirection(1);
		setCurrentIndex((prev) => (prev + 1) % testimonials.length);
	};

	const prevTestimonial = () => {
		setDirection(-1);
		setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
	};

	const slideVariants = {
		enter: (direction: number) => ({
			x: direction > 0 ? 1000 : -1000,
			opacity: 0,
		}),
		center: {
			x: 0,
			opacity: 1,
		},
		exit: (direction: number) => ({
			x: direction < 0 ? 1000 : -1000,
			opacity: 0,
		}),
	};

	return (
		<section className="relative py-20 md:py-28 bg-gradient-to-br from-pink-50/30 via-orange-50/20 to-purple-50/30 dark:from-pink-950/10 dark:via-orange-950/5 dark:to-purple-950/10 overflow-hidden">
			{/* Animated Background Orbs */}
			<div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-pink-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse" />
			<div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-orange-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
			
			<div className="container mx-auto px-4 relative z-10">
				<motion.div 
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="max-w-3xl mx-auto text-center mb-12 md:mb-20"
				>
					<motion.div
						initial={{ scale: 0 }}
						whileInView={{ scale: 1 }}
						viewport={{ once: true }}
						transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
					>
						<Badge variant="secondary" className="mb-4 border-pink-200 dark:border-pink-900 bg-gradient-to-r from-pink-50 to-orange-50 dark:from-pink-950/50 dark:to-orange-950/50">
							<Star className="w-3 h-3 mr-1 text-pink-600 fill-pink-600" />
							Loved by Professionals
						</Badge>
					</motion.div>
					
					<motion.h2 
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.3, duration: 0.6 }}
						className="text-3xl md:text-5xl font-bold tracking-tight mb-4"
					>
						<span className="bg-gradient-to-r from-pink-600 via-orange-600 to-purple-600 dark:from-pink-500 dark:via-orange-500 dark:to-purple-500 bg-clip-text text-transparent">
							What Our Users Are Saying
						</span>
					</motion.h2>
					
					<motion.p 
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.4, duration: 0.6 }}
						className="text-lg text-gray-600 dark:text-gray-400"
					>
						Real stories from professionals who have{" "}
						<span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-orange-600">
							supercharged their careers
						</span>{" "}
						with our help.
					</motion.p>
					
					{/* Rating Stats */}
					<motion.div
						initial={{ opacity: 0, scale: 0.8 }}
						whileInView={{ opacity: 1, scale: 1 }}
						viewport={{ once: true }}
						transition={{ delay: 0.5, duration: 0.5 }}
						className="mt-8 flex items-center justify-center gap-2 text-sm"
					>
						<div className="flex">
							{[...Array(5)].map((_, i) => (
								<motion.div
									key={i}
									initial={{ opacity: 0, rotate: -180 }}
									whileInView={{ opacity: 1, rotate: 0 }}
									viewport={{ once: true }}
									transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
								>
									<Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
								</motion.div>
							))}
						</div>
						<span className="font-semibold text-gray-900 dark:text-white">4.9/5</span>
						<span className="text-gray-500 dark:text-gray-400">from 10,000+ reviews</span>
					</motion.div>
				</motion.div>

				{/* Desktop: Grid View */}
				<motion.div
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.2 }}
					className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
				>
					{testimonials.map((testimonial, index) => (
						<TestimonialCard key={index} testimonial={testimonial} index={index} />
					))}
				</motion.div>

				{/* Mobile/Tablet: Carousel View */}
				<div className="lg:hidden relative max-w-2xl mx-auto">
					<div className="relative h-[400px] overflow-hidden">
						<AnimatePresence initial={false} custom={direction}>
							<motion.div
								key={currentIndex}
								custom={direction}
								variants={slideVariants}
								initial="enter"
								animate="center"
								exit="exit"
								transition={{
									x: { type: "spring", stiffness: 300, damping: 30 },
									opacity: { duration: 0.2 },
								}}
								className="absolute w-full"
							>
								<TestimonialCard testimonial={testimonials[currentIndex]} index={currentIndex} />
							</motion.div>
						</AnimatePresence>
					</div>

					{/* Navigation Buttons */}
					<div className="flex justify-center items-center gap-4 mt-8">
						<Button
							variant="outline"
							size="icon"
							onClick={prevTestimonial}
							className="rounded-full"
						>
							<ChevronLeft className="w-5 h-5" />
						</Button>

						{/* Dots Indicator */}
						<div className="flex gap-2">
							{testimonials.map((_, index) => (
								<button
									key={index}
									onClick={() => {
										setDirection(index > currentIndex ? 1 : -1);
										setCurrentIndex(index);
									}}
									className={`w-2 h-2 rounded-full transition-all duration-300 ${
										index === currentIndex
											? "bg-gradient-to-r from-pink-500 to-orange-500 w-8"
											: "bg-gray-300 dark:bg-gray-700"
									}`}
									aria-label={`Go to testimonial ${index + 1}`}
								/>
							))}
						</div>

						<Button
							variant="outline"
							size="icon"
							onClick={nextTestimonial}
							className="rounded-full"
						>
							<ChevronRight className="w-5 h-5" />
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}

function TestimonialCard({ testimonial, index }: { testimonial: typeof testimonials[0]; index: number }) {
	const [isHovered, setIsHovered] = useState(false);
	
	return (
		<motion.div
			variants={itemVariants}
			whileHover={{
				scale: 1.03,
				y: -8,
				transition: { duration: 0.3, type: "spring", stiffness: 300 },
			}}
			onHoverStart={() => setIsHovered(true)}
			onHoverEnd={() => setIsHovered(false)}
			className="relative bg-white dark:bg-gray-800/50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col border border-gray-200 dark:border-gray-700/50 overflow-hidden group"
		>
			{/* Gradient Border on Hover */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: isHovered ? 1 : 0 }}
				className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-orange-500/20 to-purple-500/20 rounded-2xl blur-xl"
			/>
			
			{/* Quote Icon Background */}
			<div className="absolute top-4 right-4 opacity-5 dark:opacity-10">
				<Quote className="w-24 h-24 text-pink-500" />
			</div>
			
			<div className="relative z-10">
				{/* Avatar and Info */}
				<div className="flex items-center mb-6">
					<motion.div
						whileHover={{ scale: 1.1, rotate: 5 }}
						transition={{ type: "spring", stiffness: 300 }}
					>
						<Avatar className="h-14 w-14 mr-4 ring-2 ring-pink-500/30 group-hover:ring-pink-500/60 transition-all">
							<AvatarImage
								src={testimonial.avatar}
								alt={testimonial.name}
							/>
							<AvatarFallback className="bg-gradient-to-br from-pink-500 to-orange-500 text-white text-lg font-bold">
								{testimonial.name.charAt(0)}
							</AvatarFallback>
						</Avatar>
					</motion.div>
					<div>
						<h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 group-hover:text-pink-600 dark:group-hover:text-pink-500 transition-colors">
							{testimonial.name}
						</h4>
						<p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
							{testimonial.role}
						</p>
					</div>
				</div>
				
				{/* Rating Stars */}
				<div className="flex mb-5 gap-1">
					{[...Array(testimonial.rating)].map((_, i) => (
						<motion.div
							key={i}
							initial={{ opacity: 0, scale: 0 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: index * 0.1 + i * 0.05 }}
							whileHover={{ 
								scale: 1.2, 
								rotate: 360,
								transition: { duration: 0.3 }
							}}
						>
							<Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
						</motion.div>
					))}
				</div>
				
				{/* Quote Mark */}
				<Quote className="w-10 h-10 text-pink-500/30 mb-4 group-hover:text-pink-500/50 transition-colors" />
				
				{/* Testimonial Text */}
				<p className="text-gray-700 dark:text-gray-300 flex-1 leading-relaxed text-base">
					{testimonial.comment}
				</p>
				
				{/* Gradient Line at Bottom */}
				<motion.div
					initial={{ width: 0 }}
					animate={{ width: isHovered ? "100%" : "0%" }}
					transition={{ duration: 0.3 }}
					className="h-1 bg-gradient-to-r from-pink-500 via-orange-500 to-purple-500 rounded-full mt-6"
				/>
			</div>
		</motion.div>
	);
}

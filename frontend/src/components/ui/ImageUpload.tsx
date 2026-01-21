'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface ImageUploadProps {
	value?: string;
	onChange: (url: string) => void;
	bucket?: string;
	path?: string;
	className?: string;
	label?: string;
}

export function ImageUpload({
	value,
	onChange,
	bucket = 'org-logos',
	path = 'logos',
	className,
	label = 'Organization Logo'
}: ImageUploadProps) {
	const [isUploading, setIsUploading] = useState(false);
	const [dragActive, setDragActive] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleUpload = async (file: File) => {
		try {
			setIsUploading(true);

			const fileExt = file.name.split('.').pop();
			const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
			const filePath = `${path}/${fileName}`;

			const { data, error } = await supabase.storage
				.from(bucket)
				.upload(filePath, file);

			if (error) throw error;

			const { data: { publicUrl } } = supabase.storage
				.from(bucket)
				.getPublicUrl(filePath);

			onChange(publicUrl);
		} catch (error) {
			console.error('Error uploading image:', error);
			alert('Failed to upload image. Please try again.');
		} finally {
			setIsUploading(false);
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.[0]) {
			handleUpload(e.target.files[0]);
		}
	};

	const onDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setDragActive(true);
	};

	const onDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setDragActive(false);
	};

	const onDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setDragActive(false);
		if (e.dataTransfer.files?.[0]) {
			handleUpload(e.dataTransfer.files[0]);
		}
	};

	const removeImage = () => {
		onChange('');
	};

	return (
		<div className={cn("space-y-4", className)}>
			<label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 block">
				{label}
			</label>

			<div
				onDragOver={onDragOver}
				onDragLeave={onDragLeave}
				onDrop={onDrop}
				className={cn(
					"relative aspect-square md:aspect-video rounded-3xl border-2 border-dashed transition-all duration-300 overflow-hidden group",
					value
						? "border-green-500/50 bg-green-500/[0.02]"
						: "border-white/10 hover:border-blue-500/30 bg-white/5 hover:bg-white/[0.08]",
					dragActive && "border-blue-500 bg-blue-500/10 scale-[1.02]",
					isUploading && "opacity-50 pointer-events-none"
				)}
			>
				{value ? (
					<div className="relative w-full h-full">
						<img
							src={value}
							alt="Preview"
							className="w-full h-full object-contain p-4"
						/>
						<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
							<Button
								type="button"
								variant="destructive"
								size="sm"
								onClick={removeImage}
								className="rounded-xl h-10 px-4 font-black uppercase tracking-widest text-[10px]"
							>
								<X className="w-4 h-4 mr-2" /> Remove
							</Button>
							<Button
								type="button"
								variant="secondary"
								size="sm"
								onClick={() => fileInputRef.current?.click()}
								className="rounded-xl h-10 px-4 font-black uppercase tracking-widest text-[10px] bg-white text-black"
							>
								Change
							</Button>
						</div>
						<div className="absolute bottom-4 right-4 bg-green-500 text-white p-1.5 rounded-full shadow-lg">
							<CheckCircle2 className="w-4 h-4" />
						</div>
					</div>
				) : (
					<button
						type="button"
						onClick={() => fileInputRef.current?.click()}
						className="w-full h-full flex flex-col items-center justify-center gap-4 group"
					>
						<div className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
							{isUploading ? (
								<Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
							) : (
								<Upload className="w-8 h-8 text-neutral-400 group-hover:text-blue-500 transition-colors" />
							)}
						</div>
						<div className="text-center">
							<p className="font-black tracking-tight text-sm mb-1 group-hover:text-blue-500 transition-colors">
								{isUploading ? "Uploading Node..." : "Upload Vector Logo"}
							</p>
							<p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
								Drag and drop or click to browse
							</p>
						</div>
					</button>
				)}

				<input
					type="file"
					ref={fileInputRef}
					onChange={handleFileChange}
					accept="image/*"
					className="hidden"
				/>
			</div>
		</div>
	);
}

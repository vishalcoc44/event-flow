import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
	try {
		const imagesDirectory = path.join(process.cwd(), 'public', 'images');

		// Check if directory exists
		if (!fs.existsSync(imagesDirectory)) {
			return NextResponse.json({ images: [] });
		}

		const fileNames = fs.readdirSync(imagesDirectory);

		// Filter for valid image files
		const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];
		const images = fileNames
			.filter((fileName) => {
				const ext = path.extname(fileName).toLowerCase();
				return validExtensions.includes(ext);
			})
			.map((fileName) => `/images/${fileName}`);

		return NextResponse.json({ images });
	} catch (error) {
		console.error('Error reading images directory:', error);
		return NextResponse.json(
			{ error: 'Failed to load images' },
			{ status: 500 }
		);
	}
}

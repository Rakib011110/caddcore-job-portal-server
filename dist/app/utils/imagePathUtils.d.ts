import { Request } from 'express';
/**
 * Constructs a full URL for an image path
 * @param imagePath - The relative image path stored in database
 * @param req - Express request object to get the base URL
 * @returns Full URL to the image
 */
export declare const getImageUrl: (imagePath: string, req: Request) => string;
/**
 * Processes quiz data to include full image URLs
 * @param quiz - Quiz object that may contain image paths
 * @param req - Express request object
 * @returns Quiz object with full image URLs
 */
export declare const processQuizImageUrls: (quiz: any, req: Request) => any;
/**
 * Processes questions data to include full image URLs
 * @param questions - Array of question objects that may contain image paths
 * @param req - Express request object
 * @returns Array of questions with full image URLs
 */
export declare const processQuestionsImageUrls: (questions: any[], req: Request) => any[];
//# sourceMappingURL=imagePathUtils.d.ts.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processQuestionsImageUrls = exports.processQuizImageUrls = exports.getImageUrl = void 0;
/**
 * Constructs a full URL for an image path
 * @param imagePath - The relative image path stored in database
 * @param req - Express request object to get the base URL
 * @returns Full URL to the image
 */
const getImageUrl = (imagePath, req) => {
    if (!imagePath)
        return '';
    // If already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    // Construct full URL
    const protocol = req.secure ? 'https' : 'http';
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;
    // Remove leading slash if present to avoid double slashes
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    return `${baseUrl}/${cleanPath}`;
};
exports.getImageUrl = getImageUrl;
/**
 * Processes quiz data to include full image URLs
 * @param quiz - Quiz object that may contain image paths
 * @param req - Express request object
 * @returns Quiz object with full image URLs
 */
const processQuizImageUrls = (quiz, req) => {
    if (!quiz)
        return quiz;
    const processedQuiz = {
        ...quiz,
        descriptionImage: quiz.descriptionImage ? (0, exports.getImageUrl)(quiz.descriptionImage, req) : undefined
    };
    // If quiz is a mongoose document, convert to plain object
    return quiz.toObject ? processedQuiz : processedQuiz;
};
exports.processQuizImageUrls = processQuizImageUrls;
/**
 * Processes questions data to include full image URLs
 * @param questions - Array of question objects that may contain image paths
 * @param req - Express request object
 * @returns Array of questions with full image URLs
 */
const processQuestionsImageUrls = (questions, req) => {
    if (!questions || !Array.isArray(questions))
        return questions;
    return questions.map(question => {
        const processedQuestion = {
            ...question,
            questionImage: question.questionImage ? (0, exports.getImageUrl)(question.questionImage, req) : undefined,
            options: question.options?.map((option) => ({
                ...option,
                image: option.image ? (0, exports.getImageUrl)(option.image, req) : undefined
            })) || []
        };
        // If question is a mongoose document, convert to plain object
        return question.toObject ? processedQuestion : processedQuestion;
    });
};
exports.processQuestionsImageUrls = processQuestionsImageUrls;
//# sourceMappingURL=imagePathUtils.js.map
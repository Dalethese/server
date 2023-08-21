import { Request, Response } from "express";
import { courseService } from "../services/courseService";
import { error } from "console";
import { getPaginationParams } from "../helpers/getPaginationParams";
import { AuthenticatedRequest } from "../middlewares/auth";
import { likeService } from "../services/likeService";
import { favoriteService } from "../services/favoriteService";

export const coursesController = {
  /** GET /courses/featured */
  featured: async (req: Request, res: Response) => {
    try {
      const featuredCourses = await courseService.getRandomFeaturedCourses();
      return res.json(featuredCourses);
    } catch (err) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
    }
  },
  /** GET /courses/newest */
  newest: async (req: Request, res: Response) => {
    try {
      const newestCourses = await courseService.getTopTenNewest();
      return res.json(newestCourses);
    } catch (err) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
    }
  },
  /** GET /courses/search?page=num&perPage=num&name=string */
  search: async (req: Request, res: Response) => {
    const { name } = req.query;
    const [page, perPage] = getPaginationParams(req.query);

    try {
      if (typeof name !== "string") throw new Error("name param must be type string");

      const courses = await courseService.findByName(name, page, perPage);
      return res.json(courses);
    } catch (err) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
    }
  },
  /** GET /courses/:id */
  show: async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const courseId = req.params.id;

    try {
      const course = await courseService.findByIdWithEpisodes(courseId);

      if (!course) {
        return res.status(404).json({ message: "Curso não encontrado" });
      }

      const liked = await likeService.isLiked(userId, +courseId);
      const favorited = await favoriteService.isFavorited(userId, +courseId);
      return res.json({ ...course.get(), liked, favorited });
    } catch (err) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
    }
  },
};

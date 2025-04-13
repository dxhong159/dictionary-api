import { Request, Response } from "express";
import { IDictionaryService } from "../interfaces/dictionary-service";
export declare const setDictionaryServices: (services: Record<string, IDictionaryService>) => void;
export declare const getWelcomeInfo: (req: Request, res: Response) => void;
export declare const getDictionaryFromMultipleSources: (req: Request, res: Response) => Promise<void>;
export declare const getDictionaryFromSingleSource: (name: string) => (req: Request, res: Response) => Promise<void>;

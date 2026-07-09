import { Request, Response } from 'express';
import { StoreSettings } from '../models/StoreSettings';

export class SettingsController {
  static async getSettings(req: Request, res: Response) {
    try {
      let settings = await StoreSettings.findOne();
      if (!settings) {
        settings = await StoreSettings.create({});
      }
      res.status(200).json({ success: true, data: settings });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
    }
  }

  static async updateSettings(req: Request, res: Response) {
    try {
      const settings = await StoreSettings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
      res.status(200).json({ success: true, data: settings });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
    }
  }
}

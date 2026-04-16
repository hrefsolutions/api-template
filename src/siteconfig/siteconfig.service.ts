import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SiteConfig } from "./model/siteconfig.model";

type SiteConfigInput = Partial<
  Pick<
    SiteConfig,
    | "siteName"
    | "lightLogo"
    | "darkLogo"
    | "favicon"
    | "homeBanner"
  >
>;

@Injectable()
export class SiteConfigService {
  constructor(
    @InjectModel(SiteConfig.name)
    private readonly siteConfigModel: Model<SiteConfig>,
  ) {}

  private readonly defaultConfig: SiteConfigInput = {
    siteName: "Template Hospedajes",
    lightLogo: "/img/logo-light.png",
    darkLogo: "/img/logo-dark.png",
    favicon: "/img/favicon.ico",
    homeBanner: "/img/slid/slide-01.jpg",
  };

  async getPublicConfig(): Promise<SiteConfigInput> {
    const doc = await this.siteConfigModel.findOne().sort({ createdAt: -1 }).lean();
    return { ...this.defaultConfig, ...(doc || {}) };
  }

  async upsertConfig(payload: SiteConfigInput): Promise<SiteConfigInput> {
    const current = await this.siteConfigModel.findOne().sort({ createdAt: -1 });

    if (!current) {
      await this.siteConfigModel.create({ ...this.defaultConfig, ...payload });
    } else {
      Object.assign(current, payload);
      await current.save();
    }

    return this.getPublicConfig();
  }
}

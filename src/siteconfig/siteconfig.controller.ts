import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@src/auth/jwt-auth.guard";
import { SiteConfigService } from "./siteconfig.service";

@Controller("site-config")
export class SiteConfigController {
  constructor(private readonly siteConfigService: SiteConfigService) {}

  @Get()
  async getConfig() {
    return this.siteConfigService.getPublicConfig();
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  async updateConfig(
    @Body()
    body: {
      siteName?: string;
      lightLogo?: string;
      darkLogo?: string;
      favicon?: string;
      homeBanner?: string;
    },
  ) {
    return this.siteConfigService.upsertConfig(body);
  }
}

import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SiteConfig, SiteConfigSchema } from "./model/siteconfig.model";
import { SiteConfigController } from "./siteconfig.controller";
import { SiteConfigService } from "./siteconfig.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SiteConfig.name, schema: SiteConfigSchema },
    ]),
  ],
  controllers: [SiteConfigController],
  providers: [SiteConfigService],
  exports: [SiteConfigService],
})
export class SiteConfigModule {}

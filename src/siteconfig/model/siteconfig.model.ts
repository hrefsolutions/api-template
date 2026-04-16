import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class SiteConfig {
  @Prop({ default: "Template Hospedajes" })
  siteName!: string;

  @Prop({ default: "/img/logo-light.png" })
  lightLogo!: string;

  @Prop({ default: "/img/logo-dark.png" })
  darkLogo!: string;

  @Prop({ default: "/img/favicon.ico" })
  favicon!: string;

  @Prop({ default: "/img/slid/slide-01.jpg" })
  homeBanner!: string;
}

export const SiteConfigSchema = SchemaFactory.createForClass(SiteConfig);

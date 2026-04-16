import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ThirdPartyReservationsService } from "../service/ThirdPartyReservations.service";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { OrderDTO, UpdateOrderDTO } from "../../order/interface/order.interface";

@Controller("thirdparty-reservation")
export class ThirdPartyReservationController {
  constructor(
    private readonly thirdPartyReservationService: ThirdPartyReservationsService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getThirdPartyPlatforms() {
    try {
      return await this.thirdPartyReservationService.getThirdPartyPlatforms();
    } catch (error: any) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createThirdPartyReservations(@Body() body: OrderDTO) {
    try {
      await this.thirdPartyReservationService.createThirdPartyReservations(
        body,
      );
      return {
        message: "Reserva creada correctamente",
        status: HttpStatus.CREATED,
      };
    } catch (error: any) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  async updateThirdPartyReservations(
    @Body() body: UpdateOrderDTO,
    @Param("id") id: string,
  ) {
    try {
      const updatedReservation =
        await this.thirdPartyReservationService.updateThirdPartyReservations(
          id,
          body,
        );
      return {
        data: updatedReservation,
        status: HttpStatus.OK,
      };
    } catch (error: any) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  async deleteThirdPartyReservations(@Param("id") id: string) {
    try {
      await this.thirdPartyReservationService.deleteThirdPartyReservations(id);
      return {
        message: "Reserva eliminada correctamente",
        status: HttpStatus.NO_CONTENT,
      };
    } catch (error: any) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
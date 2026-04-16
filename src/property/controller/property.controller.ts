import { Controller, Get, Post, Put, Delete, Param, Body, HttpStatus, HttpException, Query, UseGuards } from '@nestjs/common';
import { PropertyService } from '../service/property.service';
import { PropertyDTO, UpdatePropertyDTO } from '../interface/property.interface';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Get()
  async findAll() {
    try {
      const property = await this.propertyService.findAllProperties();
      return property;
    } catch (error: any ) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const property = await this.propertyService.getProperty(id);
      return { data: property, httpStatus: HttpStatus.OK };
    } catch (error: any ) {
      throw new HttpException(error.message, error.status || HttpStatus.NOT_FOUND);
    }
  }

  @Get('/:propertyId/:startDate/:endDate')
  async getAvailability(
    @Param('propertyId') propertyId: string,
    @Param('startDate') startDate: string,
    @Param('endDate') endDate: string,
  ): Promise<{ message: string; status: number }> {
    return this.propertyService.getAvailability(propertyId, startDate, endDate);
  }
  @Get('availability-properties')
  async getAvailableProperties(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<string[]> {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new HttpException('Fechas inválidas proporcionadas.', HttpStatus.BAD_REQUEST);
      }
      return this.propertyService.getAvailableProperties(start, end);
    } catch (error: any) {
      throw new HttpException(error.message, error.status || HttpStatus.NOT_FOUND);
    }
  }

  @Post()
  async create(@Body() property: PropertyDTO) {
    try {
      await this.propertyService.createProperty(property);
      return { message: 'Property created successfully', httpStatus: HttpStatus.CREATED };
    } catch (error: any ) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':propertyid')
  @UseGuards(JwtAuthGuard)
  async update(
      @Param('propertyid') propertyid: string,
      @Body() property: UpdatePropertyDTO
    )
    {
    try {
      const updatedOrder = await this.propertyService.updateProperty(propertyid, property);
      return { data: updatedOrder, httpStatus: HttpStatus.OK };
    } catch (error: any ) {
      throw new HttpException(error.message, error.status || HttpStatus.NOT_FOUND);
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    try {
      await this.propertyService.deleteProperty(id);
      return { message: 'Property deleted successfully', httpStatus: HttpStatus.NO_CONTENT };
    } catch (error: any ) {
      throw new HttpException(error.message, error.status || HttpStatus.NOT_FOUND);
    }
  }
}

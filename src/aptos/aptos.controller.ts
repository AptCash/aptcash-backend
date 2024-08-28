import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AptosService } from './aptos.service';
import { CreateAptoDto } from './dto/create-apto.dto';
import { UpdateAptoDto } from './dto/update-apto.dto';

@Controller('aptos')
export class AptosController {
  constructor(private readonly aptosService: AptosService) {}

  @Post()
  create(@Body() createAptoDto: CreateAptoDto) {
    return this.aptosService.create(createAptoDto);
  }

  @Get()
  findAll() {
    return this.aptosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aptosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAptoDto: UpdateAptoDto) {
    return this.aptosService.update(+id, updateAptoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.aptosService.remove(+id);
  }
}

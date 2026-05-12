import {
  Controller, Post, Get, Delete,
  Param, UseGuards, Req, UseInterceptors,
  UploadedFile, Body, HttpCode, HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DocumentsService } from './documents.service';

@Controller('solicitudes/:id/sustentos')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  // POST /api/v1/solicitudes/:id/sustentos
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: memoryStorage(), // guardar en memoria antes de subir a Cloudinary
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  subirSustento(
    @Param('id') solicitudId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('tipoSustento') tipoSustento: string,
    @Req() req: any,
  ) {
    return this.documentsService.subirSustento(
      solicitudId,
      tipoSustento ?? 'OFICIO',
      file,
      req.user.perfilId,
    );
  }

  // GET /api/v1/solicitudes/:id/sustentos
  @Get()
  listarSustentos(@Param('id') solicitudId: string) {
    return this.documentsService.listarSustentos(solicitudId);
  }

  // DELETE /api/v1/solicitudes/:id/sustentos/:sid
  @Delete(':sid')
  eliminarSustento(
    @Param('id') solicitudId: string,
    @Param('sid') sustentoId: string,
    @Req() req: any,
  ) {
    return this.documentsService.eliminarSustento(
      solicitudId,
      sustentoId,
      req.user.perfilId,
    );
  }
}

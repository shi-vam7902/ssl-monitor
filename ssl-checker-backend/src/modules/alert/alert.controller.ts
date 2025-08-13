import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { AlertService } from './alert.service';
import { 
  CreateAlertDto, 
  UpdateAlertDto, 
  AlertQueryDto, 
  CheckDomainDto, 
  BulkCheckDomainsDto,
  AlertResponseDto 
} from './alert.dto';
import { JwtAuthGuard } from 'src/middleware/jwtAuth.guard';
import { RolesGuard } from 'src/middleware/roles.guard';
import { Roles } from 'src/middleware/decorators/roles.decorator';
import { RoleName } from 'src/schemas/role.schema';

@ApiTags('SSL Alerts')
@Controller('alerts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN)
  @ApiOperation({ 
    summary: 'Add domain to monitor',
    description: 'Add new domain for SSL certificate monitoring (SUPER_ADMIN only)'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Domain added successfully',
    type: AlertResponseDto
  })
  @ApiResponse({ status: 400, description: 'Domain already exists or invalid domain' })
  @ApiResponse({ status: 403, description: 'Forbidden - SUPER_ADMIN role required' })
  @ApiBody({ type: CreateAlertDto })
  async create(
    @Body(ValidationPipe) createAlertDto: CreateAlertDto,
    @Request() req: any,
  ) {
    return await this.alertService.create(createAlertDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all monitored domains',
    description: 'Get paginated list of all monitored domains with SSL information'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Alerts retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        docs: {
          type: 'array',
          items: { $ref: '#/components/schemas/AlertResponseDto' }
        },
        totalDocs: { type: 'number' },
        limit: { type: 'number' },
        page: { type: 'number' },
        totalPages: { type: 'number' },
        hasNextPage: { type: 'boolean' },
        hasPrevPage: { type: 'boolean' },
        nextPage: { type: 'number', nullable: true },
        prevPage: { type: 'number', nullable: true }
      }
    }
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'example.com' })
  @ApiQuery({ name: 'status', required: false, enum: ['valid', 'expiring', 'expired'] })
  @ApiQuery({ name: 'daysRemaining', required: false, example: 30 })
  async findAll(@Query(ValidationPipe) query: AlertQueryDto) {
    return await this.alertService.findAll(query);
  }

  @Get('dashboard/stats')
  @ApiOperation({ 
    summary: 'Get dashboard statistics',
    description: 'Get overview statistics for SSL monitoring dashboard'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Dashboard statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalDomains: { type: 'number' },
        validCertificates: { type: 'number' },
        expiringCertificates: { type: 'number' },
        expiredCertificates: { type: 'number' },
        recentlyChecked: { type: 'number' }
      }
    }
  })
  async getDashboardStats() {
    return await this.alertService.getDashboardStats();
  }

  @Post('check-domain')
  @ApiOperation({ 
    summary: 'Check single domain SSL certificate',
    description: 'Check SSL certificate for a single domain without adding to monitoring'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'SSL certificate information retrieved',
    schema: {
      type: 'object',
      properties: {
        domain: { type: 'string' },
        expiryDate: { type: 'string', format: 'date-time' },
        daysRemaining: { type: 'number' },
        status: { type: 'string', enum: ['valid', 'expiring', 'expired'] },
        isValid: { type: 'boolean' },
        issuer: { type: 'string' },
        serialNumber: { type: 'string' },
        errorMessage: { type: 'string' }
      }
    }
  })
  @ApiBody({ type: CheckDomainDto })
  async checkDomain(@Body(ValidationPipe) checkDomainDto: CheckDomainDto) {
    return await this.alertService.checkDomain(checkDomainDto);
  }

  @Post('check-multiple-domains')
  @ApiOperation({ 
    summary: 'Check multiple domains SSL certificates',
    description: 'Check SSL certificates for multiple domains without adding to monitoring'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'SSL certificate information for multiple domains',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          domain: { type: 'string' },
          expiryDate: { type: 'string', format: 'date-time' },
          daysRemaining: { type: 'number' },
          status: { type: 'string', enum: ['valid', 'expiring', 'expired'] },
          isValid: { type: 'boolean' },
          issuer: { type: 'string' },
          serialNumber: { type: 'string' },
          errorMessage: { type: 'string' }
        }
      }
    }
  })
  @ApiBody({ type: BulkCheckDomainsDto })
  async checkMultipleDomains(@Body(ValidationPipe) bulkCheckDto: BulkCheckDomainsDto) {
    return await this.alertService.checkMultipleDomains(bulkCheckDto);
  }

  @Post('refresh-all')
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Refresh all monitored domains',
    description: 'Update SSL information for all monitored domains (SUPER_ADMIN only)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'All domains refreshed',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        updated: { type: 'number' },
        failed: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Forbidden - SUPER_ADMIN role required' })
  async refreshAllDomains() {
    const result = await this.alertService.updateAllDomains();
    return {
      message: 'All domains refresh completed',
      updated: result.updated,
      failed: result.failed,
    };
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get domain details',
    description: 'Get detailed information about a monitored domain'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Domain details retrieved successfully',
    type: AlertResponseDto
  })
  @ApiResponse({ status: 404, description: 'Domain not found' })
  @ApiParam({ name: 'id', example: '507f1f77bcf86cd799439011' })
  async findOne(@Param('id') id: string) {
    return await this.alertService.findOne(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN)
  @ApiOperation({ 
    summary: 'Update monitored domain',
    description: 'Update monitored domain information (SUPER_ADMIN only)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Domain updated successfully',
    type: AlertResponseDto
  })
  @ApiResponse({ status: 404, description: 'Domain not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - SUPER_ADMIN role required' })
  @ApiParam({ name: 'id', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: UpdateAlertDto })
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateAlertDto: UpdateAlertDto,
    @Request() req: any,
  ) {
    return await this.alertService.update(id, updateAlertDto, req.user.sub);
  }

  @Put(':id/refresh')
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN)
  @ApiOperation({ 
    summary: 'Refresh single domain',
    description: 'Update SSL information for a single monitored domain (SUPER_ADMIN only)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Domain refreshed successfully',
    type: AlertResponseDto
  })
  @ApiResponse({ status: 404, description: 'Domain not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - SUPER_ADMIN role required' })
  @ApiParam({ name: 'id', example: '507f1f77bcf86cd799439011' })
  async refreshDomain(@Param('id') id: string) {
    const alert = await this.alertService.findOne(id);
    return await this.alertService.updateSSLInfo(alert.domain);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Remove domain from monitoring',
    description: 'Remove domain from SSL monitoring (SUPER_ADMIN only)'
  })
  @ApiResponse({ 
    status: 204, 
    description: 'Domain removed successfully'
  })
  @ApiResponse({ status: 404, description: 'Domain not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - SUPER_ADMIN role required' })
  @ApiParam({ name: 'id', example: '507f1f77bcf86cd799439011' })
  async remove(@Param('id') id: string) {
    await this.alertService.remove(id);
  }
}
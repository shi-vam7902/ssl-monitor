import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from "@nestjs/swagger";
import { SSLService } from "./ssl.service";
import {
  CreateSSLDto,
  UpdateSSLDto,
  SSLQueryDto,
  RenewSSLDto,
  SSLResponseDto,
  RenewSSLResponseDto,
} from "./ssl.dto";
import { JwtAuthGuard } from "../../middleware/jwtAuth.guard";
import { RolesGuard } from "../../middleware/roles.guard";
import { RequirePermissions } from "../../middleware/decorators/requirePermissions.decorator";
import { PermissionType } from "../../constants/permissionType";

@ApiTags("SSL Management")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("ssl")
export class SSLController {
  constructor(private readonly sslService: SSLService) {}

  @Post()
  @RequirePermissions(PermissionType.SSL_CREATE)
  @ApiOperation({ summary: "Add a new domain to monitor" })
  @ApiResponse({
    status: 201,
    description: "Domain added successfully",
    type: SSLResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Invalid domain or SSL check failed",
  })
  @ApiResponse({ status: 409, description: "Domain already exists" })
  async create(
    @Body() createSSLDto: CreateSSLDto,
    @Request() req
  ): Promise<SSLResponseDto> {
    const record = await this.sslService.create(createSSLDto, req.user.id);
    return {
      ...record.toObject(),
      _id: record._id.toString(),
      createdBy: record.createdBy.toString(),
    } as SSLResponseDto;
  }

  @Get()
  @RequirePermissions(PermissionType.SSL_READ)
  @ApiOperation({ summary: "Get paginated list of SSL records" })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Items per page",
  })
  @ApiQuery({
    name: "status",
    required: false,
    enum: ["valid", "expiring", "expired"],
    description: "Filter by status",
  })
  @ApiQuery({
    name: "domain",
    required: false,
    type: String,
    description: "Search by domain name",
  })
  @ApiQuery({
    name: "daysRemaining",
    required: false,
    type: Number,
    description: "Filter by days remaining (<=)",
  })
  @ApiQuery({
    name: "sortBy",
    required: false,
    type: String,
    description: "Sort field",
  })
  @ApiQuery({
    name: "sortOrder",
    required: false,
    enum: ["asc", "desc"],
    description: "Sort order",
  })
  @ApiResponse({
    status: 200,
    description: "SSL records retrieved successfully",
  })
  async findAll(@Query() query: SSLQueryDto) {
    return this.sslService.findAll(query);
  }

  @Get("stats")
  @RequirePermissions(PermissionType.SSL_READ)
  @ApiOperation({ summary: "Get dashboard statistics" })
  @ApiResponse({
    status: 200,
    description: "Dashboard stats retrieved successfully",
  })
  async getDashboardStats() {
    return this.sslService.getDashboardStats();
  }

  @Get(":id")
  @RequirePermissions(PermissionType.SSL_READ)
  @ApiOperation({ summary: "Get a single SSL record" })
  @ApiResponse({
    status: 200,
    description: "SSL record retrieved successfully",
    type: SSLResponseDto,
  })
  @ApiResponse({ status: 404, description: "SSL record not found" })
  async findOne(@Param("id") id: string): Promise<SSLResponseDto> {
    const record = await this.sslService.findOne(id);
    return {
      ...record.toObject(),
      _id: record._id.toString(),
      createdBy: record.createdBy.toString(),
    } as SSLResponseDto;
  }

  @Patch(":id")
  @RequirePermissions(PermissionType.SSL_UPDATE)
  @ApiOperation({ summary: "Update an SSL record" })
  @ApiResponse({
    status: 200,
    description: "SSL record updated successfully",
    type: SSLResponseDto,
  })
  @ApiResponse({ status: 404, description: "SSL record not found" })
  @ApiResponse({ status: 409, description: "Domain already exists" })
  async update(
    @Param("id") id: string,
    @Body() updateSSLDto: UpdateSSLDto
  ): Promise<SSLResponseDto> {
    const record = await this.sslService.update(id, updateSSLDto);
    return {
      ...record.toObject(),
      _id: record._id.toString(),
      createdBy: record.createdBy.toString(),
    } as SSLResponseDto;
  }

  @Delete(":id")
  @RequirePermissions(PermissionType.SSL_DELETE)
  @ApiOperation({ summary: "Delete an SSL record" })
  @ApiResponse({ status: 200, description: "SSL record deleted successfully" })
  @ApiResponse({ status: 404, description: "SSL record not found" })
  async remove(@Param("id") id: string) {
    return this.sslService.remove(id);
  }

  @Post(":id/renew")
  @RequirePermissions(PermissionType.SSL_RENEW)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Manual SSL certificate renewal/recheck" })
  @ApiResponse({
    status: 200,
    description: "SSL renewal completed successfully",
    type: RenewSSLResponseDto,
  })
  @ApiResponse({ status: 404, description: "SSL record not found" })
  async renew(
    @Param("id") id: string,
    @Body() renewDto: RenewSSLDto
  ): Promise<RenewSSLResponseDto> {
    return this.sslService.renew(id, renewDto.force);
  }
}

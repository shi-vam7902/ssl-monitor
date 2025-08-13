import { Controller, Post, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Public } from "src/middleware/decorators/public.decorator";
import { SeedingService } from "./seeding.service";

@ApiTags("Seeding")
@Controller("seed")
export class SeedingController {
  constructor(private readonly seedingService: SeedingService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Manual database seeding",
    description: "Seeds the database with default roles and super admin user",
  })
  @ApiResponse({ status: 200, description: "Database seeded successfully." })
  async seedDatabase() {
    await this.seedingService.seedRoles();
    await this.seedingService.seedSuperAdmin();
    return { message: "Database seeded successfully" };
  }
}

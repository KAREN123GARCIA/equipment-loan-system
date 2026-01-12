import { Controller, Get, Header } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { MetricsService } from "./metrics.service";

@ApiTags("metrics")
@Controller()
export class MetricsController {
  constructor(private readonly metrics: MetricsService) {}

  @Get("/metrics")
  @Header("Content-Type", "text/plain; version=0.0.4; charset=utf-8")
  metricsText() {
    return this.metrics.metricsText();
  }
}

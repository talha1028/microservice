import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { EmailService } from "src/services/email.service";
import { EmailProcessor } from "src/processors/email.processor";
@Module({
    imports: [
        BullModule.registerQueue({
        name: 'email-queue'
    })
    ],
    providers: [EmailService,EmailProcessor],
    exports: [EmailService]
    
})
export class Emailmodule{
    
}
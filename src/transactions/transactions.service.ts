import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prismaService: PrismaService) {}

  create(createTransactionDto: CreateTransactionDto) {
    return 'This action adds a new transaction';
  }

  findAll() {
    return this.prismaService.transaction.findMany();
  }

  findById(id: string) {
    return this.prismaService.transaction.findUnique({
      where: {
        id,
      },
    });
  }

  findByUser(userId: string) {
    return this.prismaService.transaction.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        userId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        fiatPayment: {
          select: {
            id: true,
            gatewayId: true,
            amountPaid: true,
            fiatCurrency: true,
            status: true,
            paidAt: true,
          },
        },
        aptosPayment: {
          select: {
            id: true,
            txHash: true,
            aptosAmount: true,
            conversionRate: true,
            convertedAt: true,
          },
        },
      },
    });
  }
}

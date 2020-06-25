import { getCustomRepository } from 'typeorm';
import { isUuid } from 'uuidv4';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    // Verify if id is a valid uuid key
    const validUuid = isUuid(id);

    if (!validUuid) {
      throw new AppError('Invalid Id.');
    }

    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const transaction = await transactionsRepository.findOne({ id });

    // Verify if DB found a registry
    if (!transaction) {
      throw new AppError('Transaction not found.');
    }

    await transactionsRepository.delete(id);
  }
}

export default DeleteTransactionService;

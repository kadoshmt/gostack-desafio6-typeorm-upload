import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: 'string';
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categortRepository = getRepository(Category);

    // verify if type is valid
    if (!['income', 'outcome'].includes(type)) {
      throw new AppError(
        'Type transactions is invalid. Allowed income or outcome only.',
      );
    }

    // verify if user have funds to perform an outcome
    if (type === 'outcome') {
      const balance = await transactionsRepository.getBalance();

      if (value > balance.total) {
        throw new AppError(
          "You don't have sufficient money to realize this transaction.",
        );
      }
    }

    // Verify if the category entry is new
    let findCategory = await categortRepository.findOne({
      title: category.trim(),
    });

    if (!findCategory) {
      findCategory = await categortRepository.create({
        title: category.trim(),
      });
      await categortRepository.save(findCategory);
    }

    const transaction = await transactionsRepository.create({
      title,
      type,
      value,
      category: findCategory,
      category_id: findCategory.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;

"""
Object-oriented bank account and transaction management system.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import List


class TransactionType(Enum):
    DEPOSIT = "DEPOSIT"
    WITHDRAWAL = "WITHDRAWAL"


@dataclass(frozen=True)
class Transaction:
    amount: float
    transaction_type: TransactionType
    timestamp: datetime = datetime.now()


class Account(ABC):
    """
    Abstract base class representing a bank account.
    """

    def __init__(self, account_number: str, owner: str, initial_balance: float = 0.0) -> None:
        self.account_number = account_number
        self.owner = owner
        self._balance = initial_balance
        self._transactions: List[Transaction] = []

    @property
    def balance(self) -> float:
        return self._balance

    @abstractmethod
    def withdraw(self, amount: float) -> bool:
        """Withdraw funds from the account."""
        pass

    def deposit(self, amount: float) -> None:
        """Deposit funds into the account."""
        if amount <= 0:
            raise ValueError("Deposit amount must be positive.")
        self._balance += amount
        self._transactions.append(Transaction(amount, TransactionType.DEPOSIT))


class SavingsAccount(Account):
    """
    Savings account with minimum balance enforcement and interest accrual.
    """

    def __init__(
        self,
        account_number: str,
        owner: str,
        initial_balance: float = 0.0,
        min_balance: float = 100.0,
        interest_rate: float = 0.03,
    ) -> None:
        super().__init__(account_number, owner, initial_balance)
        self.min_balance = min_balance
        self.interest_rate = interest_rate

    def withdraw(self, amount: float) -> bool:
        if amount <= 0:
            raise ValueError("Withdrawal amount must be positive.")
        if self._balance - amount < self.min_balance:
            return False
        self._balance -= amount
        self._transactions.append(Transaction(amount, TransactionType.WITHDRAWAL))
        return True

    def apply_interest(self) -> float:
        interest = self._balance * self.interest_rate
        self.deposit(interest)
        return interest

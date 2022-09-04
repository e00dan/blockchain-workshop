import PWCore, {
    Builder,
    Address,
    Amount,
    Cell,
    RawTransaction,
    Transaction,
    BuilderOption,
    CellDep,
    AmountUnit,
    AddressPrefix
} from '@lay2/pw-core';
import BasicCollector from './BasicCollector';

export class TransferNFTBuilder extends Builder {
    constructor(
        private toAddress: Address,
        private cells: Cell[],
        protected options: BuilderOption = {},
        private cellDeps: CellDep[],
        protected collector: BasicCollector,
        private evmAddress: string
    ) {
        super(options.feeRate, collector, options.witnessArgs);
    }

    async build(fee = new Amount('10000', AmountUnit.shannon)): Promise<Transaction> {
        const inputCells: Cell[] = [];
        const outputCells: Cell[] = [];

        if (this.cells.length === 0) {
            throw new Error('no live cells, not neccessary to change lock');
        }

        const fromAddress = this.cells[0].lock.toAddress(AddressPrefix.Testnet);
        const toAddressLock = this.toAddress.toLockScript();

        for (const cell of this.cells) {
            inputCells.push(cell);

            // mNFT Cell
            const outputCell = cell.clone();
            outputCell.lock = toAddressLock;
            outputCells.push(outputCell);

            // mNFT Receiver Ethereum Address
            const ethereumAddressCellData = `0x${cell.type?.args.slice(2)}${this.evmAddress.slice(
                2
            )}`.toLowerCase();
            const ethereumAddressCell = new Cell(
                new Amount('110', AmountUnit.ckb),
                toAddressLock,
                undefined,
                undefined,
                ethereumAddressCellData
            );
            outputCells.push(ethereumAddressCell);
        }

        // Calculate the required capacity.
        const outputCellsCapacitySum = outputCells.reduce((a, b) => a.add(b.capacity), Amount.ZERO);
        const neededAmount = outputCellsCapacitySum.add(new Amount('61', AmountUnit.ckb)).add(fee);

        // Add necessary capacity.
        const capacityCells = await this.collector.collectCapacity(fromAddress, neededAmount);
        for (const cell of capacityCells) {
            inputCells.push(cell);
        }

        // Calculate the input capacity and change cell amounts.
        const inputCapacity = inputCells.reduce((a, c) => a.add(c.capacity), Amount.ZERO);
        const changeCapacity = inputCapacity.sub(
            neededAmount.sub(new Amount('61', AmountUnit.ckb))
        );

        // Add the change cell.
        const changeLockScript = fromAddress.toLockScript();
        const changeCell = new Cell(changeCapacity, changeLockScript);
        outputCells.push(changeCell);

        // Add the required cell deps.
        const cellDeps = [
            ...this.cellDeps,
            PWCore.config.defaultLock.cellDep,
            PWCore.config.pwLock.cellDep,
            PWCore.config.sudtType.cellDep
        ];

        const rawTx = new RawTransaction(inputCells, outputCells, cellDeps);

        const tx = new Transaction(rawTx, [this.witnessArgs]);
        this.fee = Builder.calcFee(tx, this.feeRate);

        return tx;
    }

    getCollector() {
        return this.collector;
    }
}

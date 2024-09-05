import { PublicKey } from '@solana/web3.js'
import {
    ParsedTransaction,
    ParsedAta,
    Timeframe,
    ChartDataWithPrice,
} from './types'
import BN from 'bn.js'
import { configDotenv } from 'dotenv'

configDotenv()
const ENV = process.env.SM_ENV

const BASE_URL =
    ENV == 'dev' ? 'http://localhost:8000' : 'https://api.solanamirror.xyz'

export async function getTokenAccounts(address: PublicKey) {
    const endpoint = `/accounts/${address.toString()}`
    const res = await fetch(BASE_URL + endpoint)

    if (!res.ok) {
        throw new Error(
            `${endpoint} failed with status ${res.status}: ${res.statusText}`
        )
    }

    const json = (await res.json()) as ParsedAta<string>[]
    const parsed: ParsedAta<BN>[] = json.map((x) => ({
        ...x,
        ata: new PublicKey(x.ata),
        mint: new PublicKey(x.mint),
        balance: {
            ...x.balance,
            amount: new BN(x.balance.amount),
        },
    }))

    return parsed
}

export async function getTransactions(address: PublicKey) {
    const endpoint = `/transactions/${address.toString()}`
    const res = await fetch(BASE_URL + endpoint)

    if (!res.ok) {
        throw new Error(
            `${endpoint} failed with status ${res.status}: ${res.statusText}`
        )
    }

    const json = (await res.json()) as ParsedTransaction<string>[]
    const parsed: ParsedTransaction<BN>[] = json.map((x) => ({
        ...x,
        balances: Object.fromEntries(
            Object.entries(x.balances).map(([key, value]) => [
                key,
                {
                    pre: {
                        ...value.pre,
                        amount: new BN(value.pre.amount),
                    },
                    post: {
                        ...value.post,
                        amount: new BN(value.post.amount),
                    },
                },
            ])
        ),
    }))

    return parsed
}

export async function getChartData(
    address: PublicKey,
    range: number,
    timeframe: Timeframe
) {
    const endpoint = `/chart/${address}/${range}${timeframe}`
    const res = await fetch(BASE_URL + endpoint)

    if (!res.ok) {
        throw new Error(
            `${endpoint} failed with status ${res.status}: ${res.statusText}`
        )
    }

    const json = (await res.json()) as ChartDataWithPrice<string>[]
    const parsed: ChartDataWithPrice<BN>[] = json.map((x) => ({
        ...x,
        balances: Object.fromEntries(
            Object.entries(x.balances).map(([key, value]) => [
                key,
                {
                    ...value,
                    amount: {
                        ...value.amount,
                        amount: new BN(value.amount.amount),
                    },
                },
            ])
        ),
    }))

    return parsed
}
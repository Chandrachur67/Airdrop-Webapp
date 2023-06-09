import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

console.log(path.resolve('public', 'dist'));


import SOLANA from '@solana/web3.js';
const { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } = SOLANA;

const SOLANA_CONNECTION = new Connection(clusterApiUrl('devnet'));

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
// app.use(cors({ origin: 'http://127.0.0.1:5173' }));



// app.get("/", (req, res) => {
//     res.send("hello world!");
// })


app.post("/post", async (req, res) => {
    const { walletAdress, amount } = req.body;

    console.log(req.body);

    (async () => {
        console.log(`Requesting airdrop for ${walletAdress}`)

        try {
            // 1 - Request Airdrop
            const signature = await SOLANA_CONNECTION.requestAirdrop(
                new PublicKey(walletAdress),
                amount * LAMPORTS_PER_SOL
            );
            // 2 - Fetch the latest blockhash
            const { blockhash, lastValidBlockHeight } = await SOLANA_CONNECTION.getLatestBlockhash();
            // 3 - Confirm transaction success

            await SOLANA_CONNECTION.confirmTransaction({
                blockhash,
                lastValidBlockHeight,
                signature
            }, 'finalized');


            // 4 - Log results
            console.log(`Tx Complete: https://explorer.solana.com/tx/${signature}?cluster=devnet`)
            res.status(202).send(`https://explorer.solana.com/tx/${signature}?cluster=devnet`);
        } catch (err) {
            console.log("err");
            res.status(404).send("Enter a valid public key");
        }

    })();


})

if (process.env.NODE_ENV == 'production') {


    app.get('/', (req, res) => {
        // const __filename = fileURLToPath(import.meta.url);
        // const __dirname = dirname(__filename);
        app.use(express.static(path.resolve('public', 'dist')))
        res.sendFile(path.resolve('public', 'dist', 'index.html'))
    })
}




app.listen(8000, () => {
    console.log("server has started on port 3000");
})

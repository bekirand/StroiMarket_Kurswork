import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const folder = formData.get("folder") as string;

        if (!file) {
            return NextResponse.json({ error: "Файл не найден" }, { status: 400 });
        }

        const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
        if (!privateKey) {
            return NextResponse.json({ error: "Ключ ImageKit не настроен" }, { status: 500 });
        }

        // Превращаем файл в base64 для отправки через стандартный fetch
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64File = buffer.toString("base64");

        let sanitizedFolder = "";
        if (folder) {
            // Transliterate Cyrillic to Latin for ImageKit compatibility
            const ru = 'А-а-Б-б-В-в-Г-г-Д-д-Е-е-Ё-ё-Ж-ж-З-з-И-и-Й-й-К-к-Л-л-М-м-Н-н-О-о-П-п-Р-р-С-с-Т-т-У-у-Ф-ф-Х-х-Ц-ц-Ч-ч-Ш-ш-Щ-щ-Ъ-ъ-Ы-ы-Ь-ь-Э-э-Ю-ю-Я-я'.split('-');
            const en = 'A-a-B-b-V-v-G-g-D-d-E-e-E-e-ZH-zh-Z-z-I-i-Y-y-K-k-L-l-M-m-N-n-O-o-P-p-R-r-S-s-T-t-U-u-F-f-H-h-TS-ts-CH-ch-SH-sh-SCH-sch---Y-y---E-e-YU-yu-YA-ya'.split('-');
            let transliteratedFolder = '';
            for (let i = 0; i < folder.length; i++) {
                const s = folder.charAt(i), n = ru.indexOf(s);
                transliteratedFolder += n >= 0 ? en[n] : s;
            }

            sanitizedFolder = transliteratedFolder.replace(/[^a-zA-Z0-9\-_\.\/]/g, '_').replace(/\/+/g, '/');
        }

        const imageKit = new ImageKit({
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT as string,
        });

        const uploadResponse = await imageKit.upload({
            file: buffer,
            fileName: file.name || "uploaded_image.jpg",
            ...(folder && { folder: sanitizedFolder })
        });

        return NextResponse.json({ url: uploadResponse.url, fileId: uploadResponse.fileId });
    } catch (error: any) {
        console.error("Upload error fully:", error?.message, error?.stack, error);
        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
    }
}

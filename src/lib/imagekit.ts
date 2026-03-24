import ImageKit from "imagekit";

export const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || process.env.IMAGEKIT_PUBLIC_KEY || "",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || process.env.IMAGEKIT_URL_ENDPOINT || ""
});

/**
 * Удаляет файл из ImageKit по его URL
 * @param url Полный URL файла (начинающийся с endpoint)
 * @returns true если удалено, false если ошибка или не найдено
 */
export async function deleteImageKitFileByUrl(url: string) {
    if (!url) return false;
    try {
        const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/";

        // Извлекаем относительный путь (всё что после urlEndpoint)
        let path = url;
        if (urlEndpoint && url.startsWith(urlEndpoint)) {
            path = url.replace(urlEndpoint, "");
        } else {
            // Фолбэк на случай если urlEndpoint не настроен правильно, но URL от ImageKit
            const match = url.match(/ik\.imagekit\.io\/[^\/]+\/(.+)/);
            if (match && match[1]) {
                path = match[1];
            } else {
                return false;
            }
        }

        if (!path.startsWith("/")) path = "/" + path;

        const fileName = path.split('/').pop();
        if (!fileName) return false;

        const dirPath = path.substring(0, path.lastIndexOf('/')) || "/";

        const files = await imagekit.listFiles({
            searchQuery: `name="${fileName}"`,
            path: dirPath
        });

        if (files && files.length > 0) {
            // Убеждаемся, что нашли именно тот файл (на случай одинаковых имен в разных папках, хоть path и ограничивает)
            const file = files.find(f => (f as any).filePath === path || (f as any).url === url) || files[0];
            await imagekit.deleteFile((file as any).fileId);
            console.log(`[ImageKit] Удален файл: ${(file as any).fileId} для URL: ${url}`);
            return true;
        } else {
            console.warn(`[ImageKit] Файл не найден: ${url}`);
            return false;
        }
    } catch (error) {
        console.error("[ImageKit] Ошибка удаления файла:", error);
        return false;
    }
}

/**
 * Удаляет целую папку из ImageKit
 * @param folderPath Путь к папке, например "/products/SM-001"
 */
export async function deleteImageKitFolder(folderPath: string) {
    if (!folderPath || folderPath === "/") return false;
    try {
        await imagekit.deleteFolder(folderPath);
        console.log(`[ImageKit] Удалена папка: ${folderPath}`);
        return true;
    } catch (error) {
        console.error(`[ImageKit] Ошибка удаления папки ${folderPath}:`, error);
        return false;
    }
}

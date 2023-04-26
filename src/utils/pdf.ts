// 页面导出为pdf格式
import html2Canvas from "html2canvas";
import JsPDF from "jspdf";

export default async function exportPdf(title: string, id: string) {
    return new Promise((resolve, reject) => {
        const dom = document.querySelector(id) as HTMLElement;
        if (!dom) {
            return;
        }

        html2Canvas(dom).then((canvas) => {
            const pdf = new JsPDF("p", "mm", "a4");
            const ctx = canvas.getContext("2d");
            // a4
            const a4w = 190;
            const a4h = 272;
            // 计算一页高度
            const imgHeight = Math.floor((a4h * canvas.width) / a4w);
            if (!ctx) return;
            let renderedHeight = 0;

            while (renderedHeight < canvas.height) {
                const page = document.createElement("canvas");
                page.width = canvas.width;
                page.height = Math.min(
                    imgHeight,
                    canvas.height - renderedHeight
                ); //可能内容不足一页

                //用getImageData剪裁指定区域，并画到前面创建的canvas对象中
                const context = page.getContext("2d");
                if (!context) return;

                context.putImageData(
                    ctx.getImageData(
                        0,
                        renderedHeight,
                        canvas.width,
                        Math.min(imgHeight, canvas.height - renderedHeight)
                    ),
                    0,
                    0
                );
                pdf.addImage(
                    page.toDataURL("image/jpeg", 1.0),
                    "JPEG",
                    10,
                    10,
                    a4w,
                    Math.min(a4h, (a4w * page.height) / page.width)
                ); //添加图像到页面，保留10mm边距

                renderedHeight += imgHeight;
                if (renderedHeight < canvas.height) {
                    pdf.addPage(); //如果后面还有内容，添加一个空页
                }
            }

            pdf.save(`${title}.pdf`);
            resolve(null);
        });
    });
}

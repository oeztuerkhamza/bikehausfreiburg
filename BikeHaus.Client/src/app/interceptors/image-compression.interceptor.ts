import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { from, switchMap } from 'rxjs';
import { compressImageFile } from '../utils/image-compression';

/**
 * Transparently optimises every image that gets uploaded, anywhere in the app.
 *
 * Any request whose body is FormData is scanned for File parts; image files
 * are downscaled + re-encoded via {@link compressImageFile} before the request
 * goes out. Non-image parts (PDFs, text fields) are left untouched, so a single
 * interceptor covers bike galleries, catalog images, purchase/sale documents,
 * ID scans, receipts, logos, etc. without touching each upload site.
 */
export const imageCompressionInterceptor: HttpInterceptorFn = (req, next) => {
  if (!(req.body instanceof FormData)) {
    return next(req);
  }

  const original = req.body;
  // Snapshot entries synchronously; FormData isn't otherwise awaitable.
  const entries: [string, FormDataEntryValue][] = [];
  original.forEach((value, key) => entries.push([key, value]));

  const hasImage = entries.some(
    ([, v]) => v instanceof File && v.type.startsWith('image/'),
  );
  if (!hasImage) {
    return next(req);
  }

  const rebuild = async (): Promise<HttpRequest<unknown>> => {
    const form = new FormData();
    for (const [key, value] of entries) {
      if (value instanceof File && value.type.startsWith('image/')) {
        form.append(key, await compressImageFile(value));
      } else {
        form.append(key, value as string | Blob);
      }
    }
    return req.clone({ body: form });
  };

  return from(rebuild()).pipe(switchMap((cloned) => next(cloned)));
};

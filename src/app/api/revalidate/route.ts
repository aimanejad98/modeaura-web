import { revalidatePath } from 'next/cache';

export async function GET() {
    revalidatePath('/shop');
    revalidatePath('/');
    return new Response('Revalidated /shop and homepage');
}

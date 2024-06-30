import axios from 'axios';

const shopifyApiKey = process.env.SHOPIFY_API_KEY;
const shopifyApiSecret = process.env.SHOPIFY_API_SECRET;
const shopifyStoreUrl = 'https://your-shopify-store.myshopify.com';

export const createShopifyProduct = async (imageUrl) => {
  const response = await axios.post(
    `${shopifyStoreUrl}/admin/api/2021-04/products.json`,
    {
      product: {
        title: 'Custom Art Product',
        images: [{ src: imageUrl }],
      },
    },
    {
      headers: {
        'X-Shopify-Access-Token': shopifyApiKey,
      },
    }
  );
  return response.data.product;
};

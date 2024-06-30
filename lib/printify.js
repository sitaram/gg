import axios from 'axios';

const printifyApiKey = process.env.PRINTIFY_API_KEY;
const printifyShopId = 'your_printify_shop_id';

export const createPrintifyProduct = async (shopifyProductId, imageUrl) => {
  const response = await axios.post(
    `https://api.printify.com/v1/shops/${printifyShopId}/products.json`,
    {
      title: 'Custom Art Product',
      print_provider_id: 1,
      blueprint_id: 1,
      user_defined_id: shopifyProductId,
      images: [{ src: imageUrl }],
    },
    {
      headers: {
        Authorization: `Bearer ${printifyApiKey}`,
      },
    }
  );
  return response.data;
};

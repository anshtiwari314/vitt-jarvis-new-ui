/**
 * Recommendations data — sourced from temp2-new.js (questions_loader_res payload).
 *
 * Shape consumed by the app:
 *   { categories: [ { id, category, title, subtitle, summary, product_table, products: [...] } ] }
 */
import { questionsLoaderResExample } from "../../temp2-new.js";

export const recommendationsData = questionsLoaderResExample.salesData.recommendations;

export default recommendationsData;

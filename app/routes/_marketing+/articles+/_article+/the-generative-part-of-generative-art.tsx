import { redirect } from "@remix-run/node";

export async function loader() {
  return redirect("https://www.wking.dev/guides/the-generative-part-of-generative-art")
}

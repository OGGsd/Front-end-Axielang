import { customGetHostProtocol } from "@/customization/utils/custom-get-host-protocol";
import type { GetCodeType } from "@/types/tweaks";

/**
 * Function to get the widget code for the API
 * @param {string} flow - The current flow.
 * @returns {string} - The widget code
 */
export default function getWidgetCode({
  flowId,
  flowName,
  isAuth,
  copy = false,
}: GetCodeType): string {
  const source = copy
    ? `<script
  src="https://cdn.jsdelivr.net/gh/axie-studio/axie-studio-embedded-chat@v1.0.7/dist/build/static/js/bundle.min.js">
</script>`
    : `<script
  src="https://cdn.jsdelivr.net/gh/axie-studio/axie-studio-embedded-chat@v1.0.7/dist/
build/static/js/bundle.min.js">
</script>`;

  const { protocol, host } = customGetHostProtocol();

  return `${source}
  <axie-studio-chat
    window_title="${flowName}"
    flow_id="${flowId}"
    host_url="${protocol}//${host}"${
      !isAuth
        ? `
    api_key="..."`
        : ""
    }>
</axie-studio-chat>`;
}

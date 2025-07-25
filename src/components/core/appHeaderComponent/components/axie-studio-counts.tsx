import ShadTooltip from "@/components/common/shadTooltipComponent";
import { useDarkStore } from "@/stores/darkStore";
import { formatNumber } from "@/utils/utils";

export const AxieStudioCounts = () => {
  // Social media counts removed for Axie Studio branding
  return null;

  return (
    <div
      className="flex items-center gap-3"
      onClick={() => window.open(GITHUB_URL, "_blank")}
    >
      <ShadTooltip
        content="Go to GitHub repo"
        side="bottom"
        styleClasses="z-10"
      >
        <div className="hit-area-hover flex items-center gap-2 rounded-md p-1 text-muted-foreground">
          <FaGithub className="h-4 w-4" />
          <span className="text-xs font-semibold">{formatNumber(stars)}</span>
        </div>
      </ShadTooltip>

      <ShadTooltip
        content="Go to Discord server"
        side="bottom"
        styleClasses="z-10"
      >
        <div
          onClick={() => window.open(DISCORD_URL, "_blank")}
          className="hit-area-hover flex items-center gap-2 rounded-md p-1 text-muted-foreground"
        >
          <FaDiscord className="h-4 w-4" />
          <span className="text-xs font-semibold">
            {formatNumber(discordCount)}
          </span>
        </div>
      </ShadTooltip>
    </div>
  );
};

export default AxieStudioCounts;

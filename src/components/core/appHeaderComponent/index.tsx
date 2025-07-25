import { useEffect, useRef, useState } from "react";
import AlertDropdown from "@/alerts/alertDropDown";
import DataStaxLogo from "@/assets/DataStaxLogo.svg?react";
import AxieStudioLogo from "@/assets/AxieStudioLogo.svg?react";
import ForwardedIconComponent from "@/components/common/genericIconComponent";
import ShadTooltip from "@/components/common/shadTooltipComponent";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CustomAccountMenu from "@/customization/components/custom-AccountMenu";
import { AxieStudioCounts } from "./components/axie-studio-counts";
import { CustomOrgSelector } from "@/customization/components/custom-org-selector";
import { CustomProductSelector } from "@/customization/components/custom-product-selector";
import { ENABLE_DATASTAX_INTEGRATION } from "@/customization/feature-flags";
import { useCustomNavigate } from "@/customization/hooks/use-custom-navigate";
import useTheme from "@/customization/hooks/use-custom-theme";
import useAlertStore from "@/stores/alertStore";
import FlowMenu from "./components/FlowMenu";

export default function AppHeader(): JSX.Element {
  const notificationCenter = useAlertStore((state) => state.notificationCenter);
  const navigate = useCustomNavigate();
  const [activeState, setActiveState] = useState<"notifications" | null>(null);
  const notificationRef = useRef<HTMLButtonElement | null>(null);
  const notificationContentRef = useRef<HTMLDivElement | null>(null);
  useTheme();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const isNotificationButton = notificationRef.current?.contains(target);
      const isNotificationContent =
        notificationContentRef.current?.contains(target);

      if (!isNotificationButton && !isNotificationContent) {
        setActiveState(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getNotificationBadge = () => {
    const baseClasses = "absolute h-1 w-1 rounded-full bg-destructive";
    return notificationCenter
      ? `${baseClasses} right-[0.3rem] top-[5px]`
      : "hidden";
  };

  return (
    <div
      className={`z-10 flex h-[48px] w-full items-center justify-between border-b px-6 dark:bg-background`}
      data-testid="app-header"
    >
      {/* Left Section */}
      <div
        className={`z-30 flex shrink-0 items-center gap-2`}
        data-testid="header_left_section_wrapper"
      >
        <Button
          unstyled
          onClick={() => navigate("/")}
          className="mr-1 flex h-8 w-8 items-center"
          data-testid="icon-ChevronLeft"
        >
          {ENABLE_DATASTAX_INTEGRATION ? (
            <DataStaxLogo className="fill-black dark:fill-[white]" />
          ) : (
            <AxieStudioLogo className="h-6 w-6" />
          )}
        </Button>
        {ENABLE_DATASTAX_INTEGRATION && (
          <>
            <CustomOrgSelector />
            <CustomProductSelector />
          </>
        )}
      </div>

      {/* Middle Section */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <FlowMenu />
      </div>

      {/* Right Section */}
      <div
        className={`relative left-3 z-30 flex shrink-0 items-center gap-3`}
        data-testid="header_right_section_wrapper"
      >
        <>
          <Button
            unstyled
            className="hidden items-center whitespace-nowrap pr-2 lg:inline"
          >
            <AxieStudioCounts />
          </Button>
        </>
        <AlertDropdown
          notificationRef={notificationContentRef}
          onClose={() => setActiveState(null)}
        >
          <ShadTooltip
            content="Notifications and errors"
            side="bottom"
            styleClasses="z-10"
          >
            <AlertDropdown onClose={() => setActiveState(null)}>
              <Button
                ref={notificationRef}
                unstyled
                onClick={() =>
                  setActiveState((prev) =>
                    prev === "notifications" ? null : "notifications",
                  )
                }
                data-testid="notification_button"
              >
                <div className="hit-area-hover group relative items-center rounded-md px-2 py-2 text-muted-foreground">
                  <span className={getNotificationBadge()} />
                  <ForwardedIconComponent
                    name="Bell"
                    className={`side-bar-button-size h-4 w-4 ${
                      activeState === "notifications"
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-primary"
                    }`}
                    strokeWidth={2}
                  />
                  <span className="hidden whitespace-nowrap">
                    Notifications
                  </span>
                </div>
              </Button>
            </AlertDropdown>
          </ShadTooltip>
        </AlertDropdown>
        <Separator
          orientation="vertical"
          className="my-auto h-7 dark:border-zinc-700"
        />

        {/* Docs Button */}
        <ShadTooltip content="Documentation" side="bottom" styleClasses="z-10">
          <Button
            unstyled
            onClick={() => navigate("/docs")}
            className="hit-area-hover group relative items-center rounded-md px-2 py-2 text-muted-foreground"
            data-testid="docs_button"
          >
            <ForwardedIconComponent
              name="BookOpen"
              className="side-bar-button-size h-4 w-4 text-muted-foreground group-hover:text-primary"
              strokeWidth={2}
            />
            <span className="hidden whitespace-nowrap">Docs</span>
          </Button>
        </ShadTooltip>

        <Separator
          orientation="vertical"
          className="my-auto h-7 dark:border-zinc-700"
        />

        <div className="flex">
          <CustomAccountMenu />
        </div>
      </div>
    </div>
  );
}

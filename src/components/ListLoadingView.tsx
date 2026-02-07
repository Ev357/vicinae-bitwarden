import { Icon, List } from "@vicinae/api";
import type { EmptyViewProps } from "@vicinae/api/dist/api/components/empty-view";
import { useEffect, useState } from "react";

const ProgressIcons = [Icon.CircleProgress25, Icon.CircleProgress50, Icon.CircleProgress75, Icon.CircleProgress100];

export type ListLoadingViewProps = Omit<EmptyViewProps, "icon">;

export const ListLoadingView = (props: ListLoadingViewProps) => {
  const [progressIconIndex, setProgressIconIndex] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const progress = () => {
      timeout = setTimeout(() => {
        clearTimeout(timeout);
        setProgressIconIndex((prev) => ++prev % ProgressIcons.length);

        progress();
      }, 500);
    };

    progress();
    return () => clearTimeout(timeout);
  }, []);

  return <List.EmptyView icon={ProgressIcons[progressIconIndex]} {...props} />;
};

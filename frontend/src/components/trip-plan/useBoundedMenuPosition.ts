import { useLayoutEffect, useState, type CSSProperties, type RefObject } from 'react';

type MenuPlacement = 'bottom' | 'left' | 'right';

type UseBoundedMenuPositionOptions = {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  menuRef: RefObject<HTMLElement | null>;
  gap?: number;
  preferredSide?: 'left' | 'right';
};

const VIEWPORT_MARGIN_PX = 12;

export default function useBoundedMenuPosition({
  open,
  anchorRef,
  menuRef,
  gap = 8,
  preferredSide = 'right',
}: UseBoundedMenuPositionOptions) {
  const [placement, setPlacement] = useState<MenuPlacement>('bottom');
  const [menuStyle, setMenuStyle] = useState<CSSProperties | undefined>(undefined);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current || !menuRef.current) {
      return;
    }

    const updatePosition = () => {
      const anchorRect = anchorRef.current?.getBoundingClientRect();
      const menuRect = menuRef.current?.getBoundingClientRect();

      if (!anchorRect || !menuRect) {
        return;
      }

      const availableBelow = Math.max(
        0,
        window.innerHeight - anchorRect.bottom - gap - VIEWPORT_MARGIN_PX,
      );
      const availableLeft = Math.max(0, anchorRect.left - gap - VIEWPORT_MARGIN_PX);
      const availableRight = Math.max(
        0,
        window.innerWidth - anchorRect.right - gap - VIEWPORT_MARGIN_PX,
      );
      const canOpenBelow = menuRect.height <= availableBelow;
      const preferredSideSpace = preferredSide === 'left' ? availableLeft : availableRight;
      const fallbackSideSpace = preferredSide === 'left' ? availableRight : availableLeft;
      const preferredSideCanFit = menuRect.width <= preferredSideSpace;
      const fallbackSideCanFit = menuRect.width <= fallbackSideSpace;

      let nextPlacement: MenuPlacement = 'bottom';
      if (!canOpenBelow) {
        if (preferredSideCanFit || preferredSideSpace >= fallbackSideSpace) {
          nextPlacement = preferredSide;
        } else if (fallbackSideCanFit) {
          nextPlacement = preferredSide === 'left' ? 'right' : 'left';
        } else {
          nextPlacement = preferredSide;
        }
      }

      if (nextPlacement === 'bottom') {
        setPlacement('bottom');
        setMenuStyle(
          menuRect.height > availableBelow
            ? {
                maxHeight: `${Math.max(96, availableBelow)}px`,
                overflowY: 'auto',
              }
            : undefined,
        );
        return;
      }

      const rawTop = anchorRect.top;
      const minTop = VIEWPORT_MARGIN_PX;
      const maxTop = Math.max(
        VIEWPORT_MARGIN_PX,
        window.innerHeight - VIEWPORT_MARGIN_PX - menuRect.height,
      );
      const clampedTop = Math.min(Math.max(rawTop, minTop), maxTop);
      const relativeTop = clampedTop - anchorRect.top;
      const availableHeight = window.innerHeight - VIEWPORT_MARGIN_PX * 2;

      setPlacement(nextPlacement);
      setMenuStyle({
        top: `${relativeTop}px`,
        maxHeight: `${Math.max(96, availableHeight)}px`,
        overflowY: menuRect.height > availableHeight ? 'auto' : undefined,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [anchorRef, gap, menuRef, open, preferredSide]);

  return {
    placement: open ? placement : 'bottom',
    menuStyle: open ? menuStyle : undefined,
  };
}

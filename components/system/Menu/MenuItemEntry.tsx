import Menu, { topLeftPosition } from "components/system/Menu";
import {
  Checkmark,
  ChevronRight,
  Circle,
} from "components/system/Menu/MenuIcons";
import type { MenuItem } from "contexts/menu/useMenuContextState";
import { useEffect, useRef, useState } from "react";
import type { Position } from "react-rnd";
import { useTheme } from "styled-components";
import Button from "styles/common/Button";
import Icon from "styles/common/Icon";
import { FOCUSABLE_ELEMENT } from "utils/constants";
import { haltEvent } from "utils/functions";

type MenuItemEntryProps = MenuItem & {
  isSubMenu: boolean;
  resetMenu: () => void;
};

const MenuItemEntry: FC<MenuItemEntryProps> = ({
  action,
  checked,
  disabled,
  icon,
  isSubMenu,
  label,
  menu,
  primary,
  resetMenu,
  seperator,
  toggle,
}) => {
  const entryRef = useRef<HTMLLIElement | null>(null);
  const [subMenuOffset, setSubMenuOffset] = useState<Position>(topLeftPosition);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const { sizes } = useTheme();
  const onMouseEnter: React.MouseEventHandler = () => setShowSubMenu(true);
  const onMouseLeave: React.MouseEventHandler = ({ relatedTarget }) => {
    if (
      !(relatedTarget instanceof HTMLElement) ||
      !entryRef.current?.contains(relatedTarget)
    ) {
      setShowSubMenu(false);
    }
  };
  const subMenuEvents = menu
    ? {
        onBlur: onMouseLeave as unknown as React.FocusEventHandler,
        onMouseEnter,
        onMouseLeave,
      }
    : {};

  useEffect(() => {
    const menuEntryElement = entryRef.current;
    const touchListener = (event: TouchEvent): void => {
      if (!isSubMenu && menu && !showSubMenu) haltEvent(event);
      setShowSubMenu(true);
    };

    menuEntryElement?.addEventListener("touchstart", touchListener);

    return () =>
      menuEntryElement?.removeEventListener("touchstart", touchListener);
  }, [isSubMenu, menu, showSubMenu]);

  useEffect(() => {
    if (menu && entryRef.current) {
      const { height, width } = entryRef.current.getBoundingClientRect();

      setSubMenuOffset({
        x: width - sizes.contextMenu.subMenuOffset,
        y: -height - sizes.contextMenu.subMenuOffset,
      });
    }
  }, [menu, sizes.contextMenu.subMenuOffset]);

  return (
    <li
      ref={entryRef}
      className={disabled ? "disabled" : undefined}
      {...FOCUSABLE_ELEMENT}
      {...(menu && subMenuEvents)}
    >
      {seperator ? (
        <hr />
      ) : (
        <Button
          as="figure"
          className={showSubMenu ? "active" : undefined}
          onClick={() => {
            if (!menu) {
              action?.();
              resetMenu();
            }
          }}
        >
          {icon && <Icon $imgSize={16} alt={label} src={icon} />}
          {checked && <Checkmark className="left" />}
          {toggle && <Circle className="left" />}
          <figcaption className={primary ? "primary" : undefined}>
            {label}
          </figcaption>
          {menu && <ChevronRight className="right" />}
        </Button>
      )}
      {showSubMenu && <Menu subMenu={{ items: menu, ...subMenuOffset }} />}
    </li>
  );
};

export default MenuItemEntry;

import React from 'react';
export { User } from './user'

export interface MenuItemProps {
    menus?: React.ReactNode;
}

declare const PwaSidebar: React.FC<MenuItemProps>;

export default UserInfo;
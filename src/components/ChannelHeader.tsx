import { StackedModalProps, useModals } from "@mattjennings/react-modal-stack";
import { observer } from "mobx-react-lite";
import React, { ComponentType } from "react";
import styled from "styled-components";
import { ContextMenuContext } from "../contexts/ContextMenuContext";
import { useAppStore } from "../stores/AppStore";
import Guild from "../stores/objects/Guild";
import { IContextMenuItem } from "./ContextMenuItem";
import Icon from "./Icon";
import { SectionHeader } from "./SectionHeader";
import LeaveServerModal from "./modals/LeaveServerModal";

const Wrapper = styled(SectionHeader)`
	background-color: var(--background-secondary);
	cursor: pointer;

	&:hover {
		background-color: var(--background-secondary-highlight);
	}
`;

const HeaderText = styled.header`
	font-size: 16px;
	font-weight: var(--font-weight-medium);
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
`;

interface Props {
	guild?: Guild;
	guildId?: string;
}

function ChannelHeader({ guild, guildId }: Props) {
	const app = useAppStore();
	const contextMenu = React.useContext(ContextMenuContext);
	const { openModal } = useModals();

	const [contextMenuItems, setContextMenuItems] = React.useState<IContextMenuItem[]>([]);

	React.useEffect(() => {
		if (guild && guild.ownerId !== app.account?.id) {
			setContextMenuItems([
				{
					label: "Leave Server",
					color: "var(--danger)",
					onClick: async () => {
						openModal(LeaveServerModal as ComponentType<StackedModalProps>, {
							guild: guild!,
						});
					},
					iconProps: {
						icon: "mdiLocationExit",
						color: "var(--danger)",
					},
					hover: {
						color: "var(--text)",
						backgroundColor: "var(--danger)",
					},
				},
			]);
		} else {
			setContextMenuItems([]);
		}
	}, [guild]);

	function openMenu(e: React.MouseEvent<HTMLDivElement>) {
		e.stopPropagation();

		if (contextMenu.visible) {
			// "toggles" the menu
			contextMenu.close();
			return;
		}

		const horizontalPadding = 5;
		const verticalPadding = 10;
		contextMenu.open({
			position: {
				x: e.currentTarget.offsetLeft + horizontalPadding, // centers the menu under the header
				y: e.currentTarget.offsetHeight + horizontalPadding, // add a slight gap between the header and the menu
			},
			items: contextMenuItems,
			style: {
				width: e.currentTarget.clientWidth - verticalPadding, // adds "margin" to the left and right of the menu
				boxSizing: "border-box",
			},
		});
	}

	if (guildId === "@me") {
		return (
			<Wrapper
				style={{
					cursor: "default",
					pointerEvents: "none",
					display: "flex",
					justifyContent: "center",
				}}
			>
				<HeaderText>Direct Messages</HeaderText>
			</Wrapper>
		);
	}
	if (!guild) return null;

	return (
		<Wrapper onClick={openMenu}>
			<HeaderText>{guild.name}</HeaderText>
			<Icon icon="mdiChevronDown" size="20px" color="var(--text)" />
		</Wrapper>
	);
}

export default observer(ChannelHeader);

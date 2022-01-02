import { Button, Flex } from "@chakra-ui/react";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const Navbar: React.FC = () => {
	const location = useLocation();

	const isWatch = location.pathname.startsWith("/watch");
	const isBroadcast = location.pathname.startsWith("/broadcast");

	return (
		<Flex width="100%" height={20} borderTopWidth="1px" borderTopColor="gray.200" borderTopStyle="solid" >
			<NavbarTab text="Home" route="/" active={!isWatch && !isBroadcast} />
			<NavbarTab text="Watch" route="/watch" active={isWatch} />
			<NavbarTab text="Broadcast" route="/broadcast" active={isBroadcast} />
		</Flex>
	);
};

interface NavbarTabProps {
	route: string;
	text: string;
	active?: boolean;
}

const NavbarTab: React.FC<NavbarTabProps> = ({ route, text, active }) => {
	const navigate = useNavigate();
	return (
		<Button
			onClick={() => navigate(route)}
			flexGrow={1}
			height="100%"
			borderRadius={0}
			colorScheme="green"
			variant={(active ?? false) ? "solid" : "ghost"}
			_focus={{ boxShadow: "none" }}
		>
			{text}
		</Button>
	)
};
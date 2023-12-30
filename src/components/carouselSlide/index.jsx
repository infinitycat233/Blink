/** @format */
import React, { memo } from "react";
import { Blurhash } from "react-blurhash";

import { motion } from "framer-motion";

import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";

import { yellow } from "@mui/material/colors";
import ErrorBoundary from "../errorBoundary";

import CarouselSlideError from "../errors/carousel";
import { MdiStar } from "../icons/mdiStar";
import { endsAt, getRuntime } from "../../utils/date/time";
import { useNavigate } from "react-router-dom";
import { MediaTypeIconCollection, getTypeIcon } from "../utils/iconsCollection";
import { MdiChevronRight } from "../icons/mdiChevronRight";
import { useQuery } from "@tanstack/react-query";
import { red } from "@mui/material/colors";

import { getUserApi } from "@jellyfin/sdk/lib/utils/api/user-api";
import LikeButton from "../buttons/likeButton";
import MarkPlayedButton from "../buttons/markPlayedButton";
import { useCarouselStore } from "../../utils/store/carousel";
import PlayButton from "../buttons/playButton";
import { BaseItemKind } from "@jellyfin/sdk/lib/generated-client";
import { useApi } from "../../utils/store/api";

const availableSpecialRoutes = [
	BaseItemKind.Series,
	BaseItemKind.BoxSet,
	BaseItemKind.MusicAlbum,
];

/**
 * @typedef {Object} Props
 * @property {import("@jellyfin/sdk/lib/generated-client/models").BaseItemDto} item
 */

/**
 * @description Carousel slide component
 * @param {Props}
 * @returns {React.Component}
 */
const CarouselSlide = ({ item }) => {
	const [api] = useApi((state) => [state.api]);
	const navigate = useNavigate();

	const user = useQuery({
		queryKey: ["user"],
		queryFn: async () => {
			let usr = await getUserApi(api).getCurrentUser();
			return usr.data;
		},
		networkMode: "always",
	});

	const handleMoreInfo = () => {
		if (availableSpecialRoutes.includes(item.Type)) {
			navigate(`/${item.Type.toLocaleLowerCase()}/${item.Id}`);
		} else if (item.Role) {
			navigate(`/person/${item.Id}`);
		} else {
			navigate(`/item/${item.Id}`);
		}
	};

	const [animationDirection] = useCarouselStore((state) => [
		state.direction,
	]);

	return (
		<ErrorBoundary fallback={<CarouselSlideError itemName={item.Name} />}>
			<Paper
				className="hero-carousel-slide"
				sx={{
					background: "transparent",
					px: 3,
				}}
				elevation={6}
			>
				<div className="hero-carousel-background-container">
					{!!item.ImageBlurHashes.Backdrop && (
						<>
							{Object.keys(item.ImageBlurHashes.Backdrop)
								.length != 0 && (
								<Blurhash
									hash={
										item.ImageBlurHashes.Backdrop[
											Object.keys(
												item.ImageBlurHashes
													.Backdrop,
											)[0]
										]
									}
									// hash="LEHV6nWB2yk8pyo0adR*.7kCMdnj"
									width="108"
									height="72"
									resolutionX={64}
									resolutionY={96}
									className="hero-carousel-background-blurhash"
									punch={1}
								/>
							)}
							<img
								className="hero-carousel-background-image"
								src={
									item.ParentBackdropItemId
										? `${api.basePath}/Items/${item.ParentBackdropItemId}/Images/Backdrop`
										: `${api.basePath}/Items/${item.Id}/Images/Backdrop`
								}
								style={{
									opacity: 0,
								}}
								onLoad={(e) =>
									(e.target.style.opacity = 1)
								}
								loading="eager"
							/>
						</>
					)}
					<div className="hero-carousel-background-icon-container">
						{getTypeIcon(item.Type)}
					</div>
				</div>
				<motion.div
					// initial={{
					// 	transform:
					// 		animationDirection == "right"
					// 			? "translateX(60px)"
					// 			: "translateX(-60px)",
					// 	opacity: 0,
					// }}
					// animate={{
					// 	transform: "translateX(0px)",
					// 	opacity: 1,
					// }}
					// exit={{
					// 	transform:
					// 		animationDirection == "right"
					// 			? "translateX(-60px)"
					// 			: "translateX(60px)",

					// 	opacity: 0,
					// }}
					// transition={{
					// 	duration: 0.25,
					// 	ease: "easeInOut",
					// }}
					className="hero-carousel-detail"
				>
					<Typography
						component={motion.div}
						initial={{
							transform:
								animationDirection == "right"
									? "translateX(60px)"
									: "translateX(-60px)",
							opacity: 0,
						}}
						animate={{
							transform: "translateX(0px)",
							opacity: 1,
						}}
						exit={{
							transform:
								animationDirection == "right"
									? "translateX(-60px)"
									: "translateX(60px)",

							opacity: 0,
						}}
						transition={{
							duration: 0.25,
							ease: "easeInOut",
						}}
						key={item.Id}
						variant="h2"
						className="hero-carousel-text"
						sx={{
							mb: "5px",
						}}
						overflow="visible"
					>
						{!item.ImageTags.Logo ? (
							item.Name
						) : (
							<img
								className="hero-carousel-text-logo"
								src={
									api.basePath +
									"/Items/" +
									item.Id +
									"/Images/Logo?quality=90&tag=" +
									item.ImageTags.Logo
								}
								style={{
									opacity: 0,
									transition: "opacity 0.2s",
									objectFit: "contain",
								}}
								onLoad={(e) =>
									(e.target.style.opacity = 1)
								}
							/>
						)}
					</Typography>
					<Stack
						component={motion.div}
						initial={{
							transform:
								animationDirection == "right"
									? "translateX(20px)"
									: "translateX(-20px)",
							opacity: 0,
						}}
						animate={{
							transform: "translateX(0px)",
							opacity: 1,
						}}
						exit={{
							transform:
								animationDirection == "right"
									? "translateX(-20px)"
									: "translateX(20px)",

							opacity: 0,
						}}
						transition={{
							duration: 0.25,
							ease: "easeInOut",
						}}
						direction="row"
						gap={2}
						className="hero-carousel-info"
						mt={1}
						justifyItems="flex-start"
						alignItems="center"
					>
						<Typography
							style={{ opacity: "0.8" }}
							variant="subtitle1"
						>
							{item.ProductionYear
								? item.ProductionYear
								: "Unknown"}
						</Typography>
						<Chip
							variant="filled"
							label={item.OfficialRating ?? "Not Rated"}
						/>
						<ErrorBoundary fallback={<></>}>
							<div
								style={{
									display: "flex",
									gap: "0.25em",
									alignItems: "center",
								}}
								className="hero-carousel-info-rating"
							>
								<div
									className="material-symbols-rounded "
									style={{
										// fontSize: "2.2em",
										color: yellow[400],
										fontVariationSettings:
											'"FILL" 1, "wght" 300, "GRAD" 25, "opsz" 40',
									}}
								>
									star
								</div>
								<Typography
									style={{
										opacity: "0.8",
									}}
									variant="subtitle1"
								>
									{Math.round(
										item.CommunityRating * 10,
									) / 10}
								</Typography>
							</div>
						</ErrorBoundary>
						{Boolean(item.CriticRating) && (
							<div
								style={{
									display: "flex",
									gap: "0.25em",
									alignItems: "center",
								}}
								className="hero-carousel-info-rating"
							>
								<div
									className="material-symbols-rounded "
									style={{
										color: red[400],
										fontVariationSettings:
											'"FILL" 1, "wght" 300, "GRAD" 25, "opsz" 40',
									}}
								>
									thumb_up
								</div>
								<Typography
									style={{
										opacity: "0.8",
									}}
									variant="subtitle1"
								>
									{item.CriticRating}
								</Typography>
							</div>
						)}

						{!!item.RunTimeTicks && (
							<Typography
								style={{ opacity: "0.8" }}
								variant="subtitle1"
							>
								{getRuntime(item.RunTimeTicks)}
							</Typography>
						)}
						{!!item.RunTimeTicks && (
							<Typography
								style={{ opacity: "0.8" }}
								variant="subtitle1"
							>
								{endsAt(item.RunTimeTicks)}
							</Typography>
						)}
					</Stack>
					<Typography
						component={motion.div}
						initial={{
							transform:
								animationDirection == "right"
									? "translateX(20px)"
									: "translateX(-20px)",
							opacity: 0,
						}}
						animate={{
							transform: "translateX(0px)",
							opacity: 1,
						}}
						exit={{
							transform:
								animationDirection == "right"
									? "translateX(-20px)"
									: "translateX(20px)",

							opacity: 0,
						}}
						transition={{
							duration: 0.25,
							ease: "easeInOut",
						}}
						variant="subtitle1"
						className="hero-carousel-text"
						sx={{
							display: "-webkit-box",
							maxWidth: "70%",
							maxHeight: "50%",
							textOverflow: "ellipsis",
							overflow: "hidden",
							WebkitLineClamp: "4",
							WebkitBoxOrient: "vertical",
						}}
					>
						{item.Overview}
					</Typography>

					<Stack
						mt={3}
						direction="row"
						gap={3}
						width="100%"
						className="hero-carousel-button-container"
						alignItems="center"
					>
						<PlayButton
							itemId={item.Id}
							userId={user.data.Id}
							itemType={item.Type}
							currentAudioTrack={0}
							currentSubTrack={0}
							currentVideoTrack={0}
							buttonProps={{
								size: "large",
							}}
							itemUserData={item.UserData}
							audio={
								item.Type == BaseItemKind.MusicAlbum ||
								item.Type == BaseItemKind.Audio ||
								item.Type == BaseItemKind.AudioBook ||
								item.Type == BaseItemKind.Playlist
							}
							playlistItem={
								item.Type == BaseItemKind.Playlist
							}
							playlistItemId={item.Id}
						/>

						<Button
							size="large"
							color="white"
							variant="outlined"
							endIcon={
								<div
									className="material-symbols-rounded"
									style={{
										fontSize: "2em",
									}}
								>
									chevron_right
								</div>
							}
							onClick={handleMoreInfo}
						>
							More info
						</Button>
						<Stack direction="row" gap={1}>
							<LikeButton
								itemId={item.Id}
								queryKey={["home", "latestMedia"]}
								userId={user.data.Id}
								isFavorite={item.UserData.IsFavorite}
								itemName={item.Name}
							/>
							<MarkPlayedButton
								itemId={item.Id}
								queryKey={["home", "latestMedia"]}
								userId={user.data.Id}
								isPlayed={item.UserData.Played}
								itemName={item.Name}
							/>
						</Stack>
					</Stack>
				</motion.div>
			</Paper>
		</ErrorBoundary>
	);
};

export default CarouselSlide;

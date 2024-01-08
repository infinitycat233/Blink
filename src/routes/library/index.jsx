import { motion } from "framer-motion";
/** @format */
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";

import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grow from "@mui/material/Grow";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import Popper from "@mui/material/Popper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { getArtistsApi } from "@jellyfin/sdk/lib/utils/api/artists-api";
import { getGenresApi } from "@jellyfin/sdk/lib/utils/api/genres-api";
import { getItemsApi } from "@jellyfin/sdk/lib/utils/api/items-api";
import { getMusicGenresApi } from "@jellyfin/sdk/lib/utils/api/music-genres-api";
import { getPersonsApi } from "@jellyfin/sdk/lib/utils/api/persons-api";
import { getStudiosApi } from "@jellyfin/sdk/lib/utils/api/studios-api";
import { getUserApi } from "@jellyfin/sdk/lib/utils/api/user-api";

import { Card } from "../../components/card/card";
import { EmptyNotice } from "../../components/notices/emptyNotice/emptyNotice";

import { MdiChevronDown } from "../../components/icons/mdiChevronDown";
import { MdiFilterOutline } from "../../components/icons/mdiFilterOutline";
import { MdiSortAscending } from "../../components/icons/mdiSortAscending";
import { MdiSortDescending } from "../../components/icons/mdiSortDescending";

import {
	BaseItemKind,
	ItemFields,
	SortOrder,
} from "@jellyfin/sdk/lib/generated-client";
import GenreView from "../../components/layouts/library/genreView";
import MusicTrack from "../../components/musicTrack";
import { ErrorNotice } from "../../components/notices/errorNotice/errorNotice";
import { useBackdropStore } from "../../utils/store/backdrop";

import { getUserLibraryApi } from "@jellyfin/sdk/lib/utils/api/user-library-api";
import { useApi } from "../../utils/store/api";
import "./library.module.scss";

const LibraryView = () => {
	const [api] = useApi((state) => [state.api]);
	const [page, setPage] = useState(1);
	const maxDisplayItems = 100;

	const { id } = useParams();

	const user = useQuery({
		queryKey: ["user"],
		queryFn: async () => {
			const usr = await getUserApi(api).getCurrentUser();
			return usr.data;
		},
		networkMode: "always",
	});

	const [sortAscending, setSortAscending] = useState(true);
	const [sortBy, setSortBy] = useState("");

	/**
	 * @typedef {{title: string, value: string}} SortObject
	 */

	/**
	 * @type {[SortObject[], Function]}
	 */
	const [sortByData, setSortByData] = useState([]);

	const handleSortBy = (e) => {
		setSortBy(e.target.value);
	};

	const currentLib = useQuery({
		queryKey: ["libraryView", "currentLib", id],
		queryFn: async () => {
			const result = await getUserLibraryApi(api).getItem({
				userId: user.data.Id,
				itemId: [id],
			});
			return result.data;
		},
		enabled: !!user.data,
		networkMode: "always",
		gcTime: 0,
	});

	const [isPlayed, setIsPlayed] = useState(false);
	const [isUnPlayed, setIsUnPlayed] = useState(false);
	const [isResumable, setIsResumable] = useState(false);
	const [isFavorite, setisFavorite] = useState(false);
	const [isLiked, setIsLiked] = useState(false);
	const [isUnliked, setIsUnliked] = useState(false);

	const [hasSubtitles, setHasSubtitles] = useState(false);
	const [hasTrailer, setHasTrailer] = useState(false);
	const [hasSpecialFeature, setHasSpecialFeature] = useState(false);
	const [hasThemeSong, setHasThemeSong] = useState(false);
	const [hasThemeVideo, setHasThemeVideo] = useState(false);

	const [isBluRay, setIsBluRay] = useState(false);
	const [isDVD, setIsDVD] = useState(false);
	const [isHD, setIsHD] = useState(false);
	const [is4K, setIs4K] = useState(false);
	const [is3D, setIs3D] = useState(false);

	const [currentViewType, setCurrentViewType] = useState("");

	/**
	 * @type {[SortObject[], Function]}
	 */
	const [viewType, setViewType] = useState([]);

	useEffect(() => {
		if (currentLib.isError) {
			console.error(currentLib.error);
		}
		if (currentLib.isSuccess) {
			setViewType(null);
			if (currentLib.data.CollectionType === "movies") {
				setCurrentViewType(BaseItemKind.Movie);
				setViewType([
					{ title: "Movies", value: BaseItemKind.Movie },
					{ title: "Genres", value: BaseItemKind.Genre },
					{ title: "Studios", value: BaseItemKind.Studio },
				]);
			} else if (currentLib.data.CollectionType === "music") {
				setCurrentViewType(BaseItemKind.MusicAlbum);
				setViewType([
					{ title: "Albums", value: BaseItemKind.MusicAlbum },
					{ title: "Songs", value: BaseItemKind.Audio },
					{ title: "Artists", value: BaseItemKind.MusicArtist },
					{ title: "Genres", value: BaseItemKind.MusicGenre },
				]);
			} else if (currentLib.data.CollectionType === "tvshows") {
				setCurrentViewType(BaseItemKind.Series);
				setViewType([
					{ title: "Series", value: BaseItemKind.Series },
					{ title: "Genres", value: BaseItemKind.Genre },
					{ title: "Networks", value: BaseItemKind.Studio },
				]);
			} else if (currentLib.data.CollectionType === "playlists") {
				setCurrentViewType(BaseItemKind.PlaylistsFolder);
				setViewType([
					{
						title: "Playlists",
						value: BaseItemKind.PlaylistsFolder,
					},
				]);
			} else {
				// currentViewType cant be "" or null or undefined since it is converted to Boolean to enable fetchItems query
				setCurrentViewType("none");
				setViewType([]);
			}
			if (currentLib.data.CollectionType === "movies") {
				setSortBy("SortName");
				setSortByData([
					{ title: "Name", value: "SortName" },
					{ title: "Critic Rating", value: "CriticRating" },
					{ title: "Rating", value: "CommunityRating" },
					{ title: "Date Added", value: "DateCreated" },
					{ title: "Play Count", value: "PlayCount" },
					{ title: "Release Date", value: "PremiereDate" },
					{ title: "Runtime", value: "Runtime" },
					{ title: "Random", value: "Random" },
				]);
			} else if (currentLib.data.CollectionType === "tvshows") {
				setSortBy("SortName");
				setSortByData([
					{ title: "Name", value: "SortName" },
					{ title: "Critic Rating", value: "CriticRating" },
					{ title: "Rating", value: "CommunityRating" },
					{ title: "Date Added", value: "DateCreated" },
					{ title: "Date Played", value: "DatePlayed" },
					{ title: "Release Date", value: "PremiereDate" },
					{ title: "Random", value: "Random" },
				]);
			} else if (currentLib.data.CollectionType === "music") {
				setSortBy("Name");
				setSortByData([
					{ title: "Name", value: "Name" },
					{ title: "Album Artist", value: "AlbumArtist" },
					{ title: "Critic Rating", value: "CriticRating" },
					{ title: "Rating", value: "CommunityRating" },
					{ title: "Release Date", value: "PremiereDate" },
					{ title: "Date Added", value: "DateCreated" },
					{ title: "Play Count", value: "PlayCount" },
					{ title: "Runtime", value: "Runtime" },
					{ title: "Random", value: "Random" },
				]);
			} else {
				setSortBy("SortName");
				setSortByData([
					{ title: "Name", value: "SortName" },
					{ title: "Critic Rating", value: "CriticRating" },
					{ title: "Rating", value: "CommunityRating" },
					{ title: "Release Date", value: "PremiereDate" },
					{ title: "Date Added", value: "DateCreated" },
					{ title: "Play Count", value: "PlayCount" },
					{ title: "Runtime", value: "Runtime" },
					{ title: "Random", value: "Random" },
				]);
			}
		}
	}, [currentLib.isSuccess]);

	const [filterArray, setFilterArray] = useState([]);

	const [videoTypes, setVideoTypes] = useState([]);

	const items = useQuery({
		queryKey: [
			"libraryView",
			"currentLibItems",
			id,
			`page: ${page}`,
			{
				currentViewType: currentViewType,
				sortAscending: sortAscending,
				sortBy: sortBy,
				playbackFilters: filterArray,
				extraFilters: {
					hasSubtitles: hasSubtitles,
					hasTrailer: hasTrailer,
					hasSpecialFeature: hasSpecialFeature,
					hasThemeSong: hasThemeSong,
					hasThemeVideo: hasThemeVideo,
				},
				qualityFilters: {
					isBluRay: isBluRay,
					isDVD: isDVD,
					isHD: isHD,
					is4K: is4K,
					is3D: is3D,
				},
			},
		],
		queryFn: async () => {
			let result;
			if (currentViewType === "MusicArtist") {
				result = await getArtistsApi(api).getAlbumArtists({
					userId: user.data.Id,
					parentId: id,
					startIndex: maxDisplayItems * (page - 1),
					limit: maxDisplayItems,
				});
			} else if (currentViewType === "Person") {
				result = await getPersonsApi(api).getPersons({
					userId: user.data.Id,
					personTypes: ["Actor"],
					startIndex: maxDisplayItems * (page - 1),
					limit: maxDisplayItems,
				});
			} else if (currentViewType === "Genre") {
				result = await getGenresApi(api).getGenres({
					userId: user.data.Id,
					parentId: id,
					startIndex: maxDisplayItems * (page - 1),
					limit: maxDisplayItems,
				});
			} else if (currentViewType === "MusicGenre") {
				result = await getMusicGenresApi(api).getMusicGenres({
					userId: user.data.Id,
					parentId: id,
					startIndex: maxDisplayItems * (page - 1),
					limit: maxDisplayItems,
				});
			} else if (currentViewType === "Studio") {
				result = await getStudiosApi(api).getStudios({
					userId: user.data.Id,
					parentId: id,
					startIndex: maxDisplayItems * (page - 1),
					limit: maxDisplayItems,
				});
			} else {
				result = await getItemsApi(api).getItems({
					userId: user.data.Id,
					parentId: currentLib.data.Id,
					recursive:
						currentLib.data.CollectionType === "boxsets" ? undefined : true,
					includeItemTypes: [currentViewType],
					sortOrder: [
						sortAscending ? SortOrder.Ascending : SortOrder.Descending,
					],
					sortBy: sortBy,
					filters: filterArray,
					hasSubtitles: hasSubtitles ? true : undefined,
					hasTrailer: hasTrailer ? true : undefined,
					hasSpecialFeature: hasSpecialFeature ? true : undefined,
					hasThemeSong: hasThemeSong ? true : undefined,
					hasThemeVideo: hasThemeVideo ? true : undefined,
					videoTypes: videoTypes,
					isHd: isHD || undefined,
					is4K: is4K || undefined,
					is3D: is3D || undefined,
					startIndex: maxDisplayItems * (page - 1),
					limit: maxDisplayItems,
					enableUserData: true,
				});
			}
			return result.data;
		},
		// enabled: false,
		enabled: user.isSuccess && Boolean(currentViewType) && currentLib.isSuccess,
		networkMode: "always",
		// gcTime: 0,
	});

	const disabledSortViews = [
		"MusicArtist",
		"Person",
		"Genre",
		"MusicGenre",
		"Studio",
	];
	const allowedFilterViews = ["movies", "tvshows", "music", "books"];
	const onlyStatusFilterViews = ["books", "music"];

	const [filterButtonAnchorEl, setFilterButtonAnchorEl] = useState(null);
	const [filterMenuOpen, setFilterMenuOpen] = useState(false);

	const [setAppBackdrop] = useBackdropStore((state) => [state.setBackdrop]);

	useState(() => {
		// Remove App backdrop in library page
		setAppBackdrop("", "");
		console.log(items.isSuccess);
	}, []);

	if (items.isError) {
		console.error(items.error);
	}
	if (currentLib.isPending) {
		return (
			<div
				style={{
					position: "fixed",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
				}}
			>
				<CircularProgress size={72} thickness={1.4} />
			</div>
		);
	}
	if (currentLib.isSuccess) {
		return (
			<main className="scrollY library padded-top">
				<div
					style={{
						padding: "1em 1em 1em 0.6em",
						height: "4em",
						boxShadow: "0 0px 10px 12px hsl(256, 100%, 6%)",
						zIndex: 10,
						display: "flex",
						alignItems: "center",
						justifyContent: "flex-start",
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							width: "fit-content",
							padding: "0 1em",
						}}
					>
						<Typography variant="h5" sx={{ mr: 2, flexShrink: 0 }} noWrap>
							{currentLib.isPending ? (
								<CircularProgress sx={{ p: 1 }} />
							) : (
								currentLib.data.Name
							)}
						</Typography>
						<Chip
							label={
								!items.isSuccess ? (
									<CircularProgress sx={{ p: 1.5 }} />
								) : (
									items.data.TotalRecordCount
								)
							}
						/>
					</div>
				</div>
				<div className="library-items">
					<div className="library-items-header">
						<div className="library-items-options">
							{disabledSortViews.includes(currentViewType) ? (
								<></>
							) : (
								<>
									<IconButton onClick={() => setSortAscending(!sortAscending)}>
										{sortAscending ? (
											<MdiSortAscending />
										) : (
											<MdiSortDescending />
										)}
									</IconButton>

									<TextField
										disabled={!sortBy}
										select
										value={sortBy}
										onChange={handleSortBy}
										size="small"
									>
										{sortByData.map((option) => (
											<MenuItem key={option.value} value={option.value}>
												{option.title}
											</MenuItem>
										))}
									</TextField>
								</>
							)}

							{viewType.length > 0 && (
								<>
									<Divider flexItem orientation="vertical" />
									<TextField
										disabled={!currentViewType}
										select
										value={currentViewType}
										onChange={(e) => {
											setCurrentViewType(e.target.value);
										}}
										size="small"
									>
										{viewType.map((option) => (
											<MenuItem key={option.value} value={option.value}>
												{option.title}
											</MenuItem>
										))}
									</TextField>
								</>
							)}

							{currentLib.isSuccess &&
								allowedFilterViews.includes(currentLib.data.CollectionType) && (
									<>
										<Divider flexItem orientation="vertical" />
										<Button
											startIcon={<MdiFilterOutline />}
											color="white"
											onClick={(event) => {
												setFilterButtonAnchorEl(event.currentTarget);
												setFilterMenuOpen(!filterMenuOpen);
											}}
											// disabled
										>
											Filters
										</Button>
									</>
								)}
							<Popper
								open={filterMenuOpen}
								anchorEl={filterButtonAnchorEl}
								placement="bottom"
								transition
							>
								{({ TransitionProps }) => (
									<Grow {...TransitionProps} timeout={200}>
										<div className="library-filter-container">
											<Accordion className="library-filter-accordian">
												<AccordionSummary expandIcon={<MdiChevronDown />}>
													<Typography variant="subtitle1">Filters</Typography>
												</AccordionSummary>
												<AccordionDetails
													style={{
														background: "rgb(0 0 0 / 0.4)",
														padding: "0 !important",
													}}
												>
													<FormControlLabel
														className="library-filter"
														label="Played"
														control={
															<Checkbox
																value={isPlayed}
																onChange={(e) => {
																	setIsPlayed(e.target.checked);
																	if (e.target.checked) {
																		setFilterArray((state) => [
																			...state,
																			"isPlayed",
																		]);
																	} else {
																		setFilterArray(
																			filterArray.filter(
																				(val) => val !== "isPlayed",
																			),
																		);
																	}
																}}
															/>
														}
														labelPlacement="start"
														componentsProps={{
															typography: {
																style: {
																	justifySelf: "start",
																},
															},
														}}
													/>
													<FormControlLabel
														className="library-filter"
														label="Not Played"
														control={
															<Checkbox
																value={isUnPlayed}
																onChange={(e) => {
																	setIsUnPlayed(e.target.checked);
																	if (e.target.checked) {
																		setFilterArray((state) => [
																			...state,
																			"IsUnplayed",
																		]);
																	} else {
																		setFilterArray(
																			filterArray.filter(
																				(val) => val !== "IsUnplayed",
																			),
																		);
																	}
																}}
															/>
														}
														labelPlacement="start"
														componentsProps={{
															typography: {
																style: {
																	justifySelf: "start",
																},
															},
														}}
													/>
													<FormControlLabel
														className="library-filter"
														label="Resumable"
														control={
															<Checkbox
																value={isResumable}
																onChange={(e) => {
																	setIsResumable(e.target.checked);
																	if (e.target.checked) {
																		setFilterArray((state) => [
																			...state,
																			"isResumable",
																		]);
																	} else {
																		setFilterArray(
																			filterArray.filter(
																				(val) => val !== "isResumable",
																			),
																		);
																	}
																}}
															/>
														}
														labelPlacement="start"
														componentsProps={{
															typography: {
																style: {
																	justifySelf: "start",
																},
															},
														}}
													/>
													<FormControlLabel
														className="library-filter"
														label="Favorite"
														control={
															<Checkbox
																value={isFavorite}
																onChange={(e) => {
																	setisFavorite(e.target.checked);
																	if (e.target.checked) {
																		setFilterArray((state) => [
																			...state,
																			"isFavorite",
																		]);
																	} else {
																		setFilterArray(
																			filterArray.filter(
																				(val) => val !== "isFavorite",
																			),
																		);
																	}
																}}
															/>
														}
														labelPlacement="start"
														componentsProps={{
															typography: {
																style: {
																	justifySelf: "start",
																},
															},
														}}
													/>
													<FormControlLabel
														className="library-filter"
														label="Likes"
														control={
															<Checkbox
																value={isLiked}
																onChange={(e) => {
																	setIsLiked(e.target.checked);
																	if (e.target.checked) {
																		setFilterArray((state) => [
																			...state,
																			"isLiked",
																		]);
																	} else {
																		setFilterArray(
																			filterArray.filter(
																				(val) => val !== "isLiked",
																			),
																		);
																	}
																}}
															/>
														}
														labelPlacement="start"
														componentsProps={{
															typography: {
																style: {
																	justifySelf: "start",
																},
															},
														}}
													/>
													<FormControlLabel
														className="library-filter"
														label="Dislikes"
														control={
															<Checkbox
																value={isUnliked}
																onChange={(e) => {
																	setIsUnliked(e.target.checked);
																	if (e.target.checked) {
																		setFilterArray((state) => [
																			...state,
																			"isUnliked",
																		]);
																	} else {
																		setFilterArray(
																			filterArray.filter(
																				(val) => val !== "isUnliked",
																			),
																		);
																	}
																}}
															/>
														}
														labelPlacement="start"
														componentsProps={{
															typography: {
																style: {
																	justifySelf: "start",
																},
															},
														}}
													/>
												</AccordionDetails>
											</Accordion>
											{currentLib.data.CollectionType === "movies" && (
												<Accordion className="library-filter-accordian">
													<AccordionSummary expandIcon={<MdiChevronDown />}>
														<Typography variant="subtitle1">Quality</Typography>
													</AccordionSummary>
													<AccordionDetails
														style={{
															background: "rgb(0 0 0 / 0.4)",
															padding: "0 !important",
														}}
													>
														<FormControlLabel
															className="library-filter"
															label="BluRay"
															control={
																<Checkbox
																	value={isBluRay}
																	onChange={(e) => {
																		setIsBluRay(e.target.checked);
																		if (e.target.checked) {
																			setVideoTypes((state) => [
																				...state,
																				"BluRay",
																			]);
																		} else {
																			setVideoTypes(
																				filterArray.filter(
																					(val) => val !== "BluRay",
																				),
																			);
																		}
																	}}
																/>
															}
															labelPlacement="start"
															componentsProps={{
																typography: {
																	style: {
																		justifySelf: "start",
																	},
																},
															}}
														/>
														<FormControlLabel
															className="library-filter"
															label="Dvd"
															control={
																<Checkbox
																	value={isDVD}
																	onChange={(e) => {
																		setIsDVD(e.target.checked);
																		if (e.target.checked) {
																			setVideoTypes((state) => [
																				...state,
																				"Dvd",
																			]);
																		} else {
																			setVideoTypes(
																				filterArray.filter(
																					(val) => val !== "Dvd",
																				),
																			);
																		}
																	}}
																/>
															}
															labelPlacement="start"
															componentsProps={{
																typography: {
																	style: {
																		justifySelf: "start",
																	},
																},
															}}
														/>
														<FormControlLabel
															className="library-filter"
															label="Hd"
															control={
																<Checkbox
																	value={isHD}
																	onChange={(e) => {
																		setIsHD(e.target.checked);
																	}}
																/>
															}
															labelPlacement="start"
															componentsProps={{
																typography: {
																	style: {
																		justifySelf: "start",
																	},
																},
															}}
														/>
														<FormControlLabel
															className="library-filter"
															label="4k"
															control={
																<Checkbox
																	value={is4K}
																	onChange={(e) => {
																		setIs4K(e.target.checked);
																	}}
																/>
															}
															labelPlacement="start"
															componentsProps={{
																typography: {
																	style: {
																		justifySelf: "start",
																	},
																},
															}}
														/>
														<FormControlLabel
															className="library-filter"
															label="3D"
															control={
																<Checkbox
																	value={is3D}
																	onChange={(e) => {
																		setIs3D(e.target.checked);
																	}}
																/>
															}
															labelPlacement="start"
															componentsProps={{
																typography: {
																	style: {
																		justifySelf: "start",
																	},
																},
															}}
														/>
													</AccordionDetails>
												</Accordion>
											)}
											{!onlyStatusFilterViews.includes(
												currentLib.data.CollectionType,
											) && (
												<Accordion className="library-filter-accordian">
													<AccordionSummary expandIcon={<MdiChevronDown />}>
														<Typography variant="subtitle1">
															Features
														</Typography>
													</AccordionSummary>
													<AccordionDetails
														style={{
															background: "rgb(0 0 0 / 0.4)",
															padding: "0 !important",
														}}
													>
														<FormControlLabel
															className="library-filter"
															label="Subtitles"
															control={
																<Checkbox
																	value={hasSubtitles}
																	onChange={(e) => {
																		setHasSubtitles(e.target.checked);
																	}}
																/>
															}
															labelPlacement="start"
															componentsProps={{
																typography: {
																	style: {
																		justifySelf: "start",
																	},
																},
															}}
														/>
														<FormControlLabel
															className="library-filter"
															label="Trailer"
															control={
																<Checkbox
																	value={hasTrailer}
																	onChange={(e) => {
																		setHasTrailer(e.target.checked);
																	}}
																/>
															}
															labelPlacement="start"
															componentsProps={{
																typography: {
																	style: {
																		justifySelf: "start",
																	},
																},
															}}
														/>
														<FormControlLabel
															className="library-filter"
															label="Special Features"
															control={
																<Checkbox
																	value={hasSpecialFeature}
																	onChange={(e) => {
																		setHasSpecialFeature(e.target.checked);
																	}}
																/>
															}
															labelPlacement="start"
															componentsProps={{
																typography: {
																	style: {
																		justifySelf: "start",
																	},
																},
															}}
														/>
														<FormControlLabel
															className="library-filter"
															label="Theme Song"
															control={
																<Checkbox
																	value={hasThemeSong}
																	onChange={(e) => {
																		setHasThemeSong(e.target.checked);
																	}}
																/>
															}
															labelPlacement="start"
															componentsProps={{
																typography: {
																	style: {
																		justifySelf: "start",
																	},
																},
															}}
														/>
														<FormControlLabel
															className="library-filter"
															label="Theme Video"
															control={
																<Checkbox
																	value={hasThemeVideo}
																	onChange={(e) => {
																		setHasThemeVideo(e.target.checked);
																	}}
																/>
															}
															labelPlacement="start"
															componentsProps={{
																typography: {
																	style: {
																		justifySelf: "start",
																	},
																},
															}}
														/>
													</AccordionDetails>
												</Accordion>
											)}
										</div>
									</Grow>
								)}
							</Popper>
						</div>
					</div>
					{!items.isSuccess ? (
						<Box
							sx={{
								position: "absolute",
								top: 0,
								left: 0,
								height: "100%",
								width: "100%",
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
							}}
						>
							<CircularProgress
								variant="indeterminate"
								sx={{
									position: "absolute",
									top: "50%",
									left: "50%",
									transform: "translate(-50%,50%)",
									width: "50%",
								}}
							/>
						</Box>
					) : items.data.TotalRecordCount === 0 ? (
						<EmptyNotice />
					) : currentViewType === BaseItemKind.Genre ? (
						items.data.Items.map((item) => {
							return (
								<GenreView
									key={item.Id}
									libraryId={currentLib.data.Id}
									genreId={item.Id}
									genreName={item.Name}
									userId={user.data.Id}
								/>
							);
						})
					) : currentViewType !== BaseItemKind.Audio ? (
						<div className="library-grid">
							{items.data.Items.map((item) => {
								return (
									<motion.div
										style={{
											width: "100%",
										}}
										key={`${item.Id}${page}`}
										initial={{
											opacity: 0,
											transform: "scale(0.9)",
										}}
										whileInView={{
											opacity: 1,
											transform: "scale(1)",
										}}
										viewport={{
											once: true,
										}}
										transition={{
											duration: 0.25,
											ease: "anticipate",
										}}
									>
										<Card
											item={item}
											seriesId={item.SeriesId}
											cardTitle={
												item.Type === BaseItemKind.Episode
													? item.SeriesName
													: item.Name
											}
											imageType={"Primary"}
											cardCaption={
												item.Type === BaseItemKind.Episode
													? `S${item.ParentIndexNumber}:E${item.IndexNumber} - ${item.Name}`
													: item.Type === BaseItemKind.Series
													  ? `${item.ProductionYear} - ${
																item.EndDate
																	? new Date(item.EndDate).toLocaleString([], {
																			year: "numeric",
																	  })
																	: "Present"
														  }`
													  : item.ProductionYear
											}
											disableOverlay={
												item.Type === BaseItemKind.Person ||
												item.Type === BaseItemKind.Genre ||
												item.Type === BaseItemKind.MusicGenre ||
												item.Type === BaseItemKind.Studio
											}
											cardType={
												item.Type === BaseItemKind.MusicAlbum ||
												item.Type === BaseItemKind.Audio ||
												item.Type === BaseItemKind.Genre ||
												item.Type === BaseItemKind.MusicGenre ||
												item.Type === BaseItemKind.Studio ||
												item.Type === BaseItemKind.Playlist
													? "square"
													: "portrait"
											}
											queryKey={[
												"libraryView",
												"currentLibItems",
												id,
												`page: ${page}`,
												{
													currentViewType: currentViewType,
													sortAscending: sortAscending,
													sortBy: sortBy,
													playbackFilters: filterArray,
													extraFilters: {
														hasSubtitles: hasSubtitles,
														hasTrailer: hasTrailer,
														hasSpecialFeature: hasSpecialFeature,
														hasThemeSong: hasThemeSong,
														hasThemeVideo: hasThemeVideo,
													},
													qualityFilters: {
														isBluRay: isBluRay,
														isDVD: isDVD,
														isHD: isHD,
														is4K: is4K,
														is3D: is3D,
													},
												},
											]}
											userId={user.data.Id}
											imageBlurhash={
												!!item.ImageBlurHashes?.Primary &&
												item.ImageBlurHashes?.Primary[
													Object.keys(item.ImageBlurHashes.Primary)[0]
												]
											}
										/>
									</motion.div>
								);
							})}
						</div>
					) : (
						<div
							style={{
								display: "flex",
								flexDirection: "column",
							}}
						>
							{items.data.Items.map((item) => (
								<MusicTrack
									item={item}
									key={item.Id}
									queryKey={[
										"libraryView",
										"currentLibItems",
										id,
										`page: ${page}`,
										{
											currentViewType: currentViewType,
											sortAscending: sortAscending,
											sortBy: sortBy,
											playbackFilters: filterArray,
											extraFilters: {
												hasSubtitles: hasSubtitles,
												hasTrailer: hasTrailer,
												hasSpecialFeature: hasSpecialFeature,
												hasThemeSong: hasThemeSong,
												hasThemeVideo: hasThemeVideo,
											},
											qualityFilters: {
												isBluRay: isBluRay,
												isDVD: isDVD,
												isHD: isHD,
												is4K: is4K,
												is3D: is3D,
											},
										},
									]}
									userId={user.data.Id}
								/>
							))}
						</div>
					)}

					{items.isSuccess && items.data.TotalRecordCount > maxDisplayItems && (
						<Stack
							alignItems="center"
							justifyContent="center"
							paddingTop={2}
							direction="row"
						>
							<Typography variant="subtitle2" sx={{ opacity: 0.5 }}>
								{maxDisplayItems * (page - 1)} -{" "}
								{items.data.TotalRecordCount <= maxDisplayItems * page
									? items.data.TotalRecordCount
									: maxDisplayItems * page}{" "}
								of {items.data.TotalRecordCount}
							</Typography>
							<Pagination
								page={page}
								onChange={(e, val) => {
									setPage(val);
								}}
								count={Math.ceil(items.data.TotalRecordCount / maxDisplayItems)}
								sx={{
									width: "fit-content",
								}}
							/>
						</Stack>
					)}
				</div>

				{items.isError && <ErrorNotice />}
			</main>
		);
	}
	if (currentLib.isError) {
		return <h6>{currentLib.error}</h6>;
	}
};

export default LibraryView;

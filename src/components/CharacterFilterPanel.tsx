import { Ionicons } from "@expo/vector-icons";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";

// Filter options for status, gender, and species
const STATUS_FILTERS = ["", "alive", "dead", "unknown"] as const;
const GENDER_FILTERS = ["", "female", "male", "genderless", "unknown"] as const;
const SPECIES_FILTERS = ["", "human", "alien", "humanoid", "robot", "animal", "unknown"] as const;

const chipBaseClassName = "rounded-full px-4 py-2";

/**
 * FilterChip - Toggleable filter button that shows active/inactive state
 */
function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={1} className={`${chipBaseClassName} ${active ? "bg-green-500" : "bg-white border border-gray-200"}`}>
            <Text className={active ? "text-white font-semibold" : "text-gray-600"}>{label}</Text>
        </TouchableOpacity>
    );
}

interface CharacterFilterPanelProps {
    filterSheetRef: React.RefObject<BottomSheetModal | null>;
    name: string;
    setName: (name: string) => void;
    status: string;
    setStatus: (status: string) => void;
    gender: string;
    setGender: (gender: string) => void;
    species: string;
    setSpecies: (species: string) => void;
    onResetFilters: () => void;
}

/**
 * CharacterFilterPanel - Bottom sheet modal containing all character filters
 * Manages status, gender, and species filtering with chip-based UI
 */
export default function CharacterFilterPanel({
    filterSheetRef,
    name,
    setName,
    status,
    setStatus,
    gender,
    setGender,
    species,
    setSpecies,
    onResetFilters,
}: CharacterFilterPanelProps) {
    const { t } = useTranslation();

    const closeFilterSheet = () => filterSheetRef.current?.dismiss();

    const renderBackdrop = useCallback(
        (props: Parameters<NonNullable<React.ComponentProps<typeof BottomSheetModal>["backdropComponent"]>>[0]) => (
            <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
        ),
        [],
    );

    return (
        <BottomSheetModal
            ref={filterSheetRef}
            enableDynamicSizing={false}
            snapPoints={["50%", "100%"]}
            index={1}
            enablePanDownToClose
            backdropComponent={renderBackdrop}
            backgroundStyle={{ backgroundColor: "#F9FAFB" }}
            handleIndicatorStyle={{ backgroundColor: "#D1D5DB" }}
        >
            <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
                {/* Header with title and close button */}
                <View className="flex-row items-center justify-between pt-2 pb-4">
                    <View>
                        <Text className="text-2xl font-bold text-gray-900">{t("filters.title")}</Text>
                        <Text className="mt-1 text-sm text-gray-500">{t("filters.subtitle")}</Text>
                    </View>
                    <Pressable onPress={closeFilterSheet} className="h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200">
                        <Ionicons name="close" size={20} color="#374151" />
                    </Pressable>
                </View>

                {/* Name search */}
                <View className="mb-5 rounded-2xl bg-white p-4 shadow-sm">
                    <Text className="mb-3 text-sm font-semibold text-gray-900">{t("filters.name")}</Text>
                    <TextInput
                        className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-base"
                        placeholder={t("search.placeholder")}
                        placeholderTextColor="#9CA3AF"
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                {/* Status filter section */}
                <View className="mb-5 rounded-2xl bg-white p-4 shadow-sm">
                    <Text className="mb-3 text-sm font-semibold text-gray-900">{t("filters.status")}</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {STATUS_FILTERS.map((s) => (
                            <FilterChip
                                key={s}
                                label={s === "" ? t("status.all") : t(`status.${s}` as const)}
                                active={status === s}
                                onPress={() => setStatus(status === s && s !== "" ? "" : s)}
                            />
                        ))}
                    </View>
                </View>

                {/* Gender filter section */}
                <View className="mb-5 rounded-2xl bg-white p-4 shadow-sm">
                    <Text className="mb-3 text-sm font-semibold text-gray-900">{t("filters.gender")}</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {GENDER_FILTERS.map((g) => (
                            <FilterChip
                                key={g}
                                label={g === "" ? t("gender.all") : t(`gender.${g}` as const)}
                                active={gender === g}
                                onPress={() => setGender(gender === g && g !== "" ? "" : g)}
                            />
                        ))}
                    </View>
                </View>

                {/* Species filter section */}
                <View className="mb-5 rounded-2xl bg-white p-4 shadow-sm">
                    <Text className="mb-3 text-sm font-semibold text-gray-900">{t("filters.species")}</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {SPECIES_FILTERS.map((s) => (
                            <FilterChip
                                key={s}
                                label={s === "" ? t("species.all") : t(`species.${s}` as const)}
                                active={species === s}
                                onPress={() => setSpecies(species === s && s !== "" ? "" : s)}
                            />
                        ))}
                    </View>
                </View>

                {/* Action buttons */}
                <View className="flex-row gap-3">
                    <Pressable onPress={onResetFilters} className="flex-1 items-center rounded-2xl border border-gray-200 bg-white py-4">
                        <Text className="font-semibold text-gray-700">{t("filters.clearAll")}</Text>
                    </Pressable>
                    <Pressable onPress={closeFilterSheet} className="flex-1 items-center rounded-2xl bg-green-500 py-4">
                        <Text className="font-semibold text-white">{t("filters.done")}</Text>
                    </Pressable>
                </View>
            </BottomSheetScrollView>
        </BottomSheetModal>
    );
}

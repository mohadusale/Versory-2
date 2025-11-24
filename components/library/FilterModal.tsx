import SearchBar from '@/components/common/SearchBar';
import StarRating from '@/components/common/StarRating';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { FlatList, SectionList, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';

export type FilterType = 'single-horizontal' | 'multi-list' | 'star-rating';
type SingleHorizontalData = (string | number | null)[];
type MultiListData = any[];

interface SingleHorizontalConfig {
    id: string;
    title: string;
    type: 'single-horizontal';
    data: SingleHorizontalData;
}

interface MultiListConfig<T> {
    id: string;
    title: string;
    type: 'multi-list';
    data: T[];
    searchable?: boolean;
    placeholder?: string;
    
    getKey: (item: T) => string;
    getValue: (item: T) => string | number;
    getLabel: (item: T) => string;
    getSearchableString?: (item: T) => string;
}

interface StarRatingConfig {
    id: string;
    title: string;
    type: 'star-rating';
    data: null[]; // Solo para compatibilidad con la estructura
}

export type FilterSectionConfig = SingleHorizontalConfig | MultiListConfig<any> | StarRatingConfig;

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    filters: Record<string, any>;
    onApplyFilters: (filters: Record<string, any>) => void;
    sectionsConfig: FilterSectionConfig[];
}

const FilterModal: React.FC<FilterModalProps> = ({
    visible,
    onClose,
    filters,
    onApplyFilters,
    sectionsConfig,
}) => {
    const [localFilters, setLocalFilters] = useState<Record<string, any>>(filters);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

    const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

    const toggleSectionExpansion = (type: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [type]: !prev[type]
        }));
    };

    const handleFilterChange = (sectionId: string, value: any, type: FilterType) => {
        setLocalFilters(prev => {
            const newFilters = { ...prev };

            switch (type) {
                case 'single-horizontal':
                    // Simplemente asigna el valor 
                    newFilters[sectionId] = value;
                    break;

                case 'multi-list':
                    const currentValues: string[] = prev[sectionId] || [];
                    if (currentValues.includes(value)) {
                        // Quitar valor
                        newFilters[sectionId] = currentValues.filter(item => item !== value);
                    } else {
                        // Añadir valor
                        newFilters[sectionId] = [...currentValues, value];
                    }
                    break;
                
                case 'star-rating':
                    // Para rating, simplemente asigna el valor numérico
                    newFilters[sectionId] = value;
                    break;
                    
                default: 
                    break;
            }
            return newFilters;
        });
    };

    const handleApply = () => {
        onApplyFilters(localFilters);
        onClose();
    };

    const handleClearAll = () => {
        setLocalFilters({});
    };

    const activeFiltersCount = useMemo(() => {
        return Object.values(localFilters).reduce((count, value) => {
            if (Array.isArray(value) && value.length > 0) {
                return count + value.length;
            }
            // Para valores no-array, solo contar si no son null, undefined, 0, o string vacío
            if (value !== null && value !== undefined && value !== 0 && value !== '' && !Array.isArray(value)) {
                return count + 1;
            }
            return count;
        }, 0);
    }, [localFilters]);

    const sections = useMemo(() => {
        const ITEMS_TO_SHOW = 5; // Cuántos ítems mostrar por defecto

        return sectionsConfig.map(config => {
            
            if (config.type === 'single-horizontal') {
                return {
                    ...config,
                    data: [config.data], 
                    isExpandable: false,
                    isExpanded: true,
                };
            }

            if (config.type === 'star-rating') {
                return {
                    ...config,
                    data: [null], // Dato placeholder
                    isExpandable: false,
                    isExpanded: true,
                };
            }

            if (config.type === 'multi-list') {
                const searchTerm = searchTerms[config.id] || '';
                
                // 1. Determina qué función de búsqueda usar
                const searchFn = config.getSearchableString || config.getLabel;

                // 2. Filtra los datos USANDO EL ACCESSOR
                const filteredData = config.searchable && searchTerm.trim()
                    ? config.data.filter(item =>
                        // 👇 ¡TOTALMENTE DESACOPLADO!
                        searchFn(item).toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    : config.data;
                
                const isExpanded = !!expandedSections[config.id];

                // 3. Devuelve el objeto de sección completo
                return {
                    ...config, // Pasa 'getKey', 'getLabel', etc. a 'renderItem'
                    data: isExpanded
                        ? filteredData
                        : filteredData.slice(0, ITEMS_TO_SHOW),
                    isExpandable: filteredData.length > ITEMS_TO_SHOW,
                    isExpanded: isExpanded,
                };
            }
            return null;
        
        }).filter(Boolean) as (FilterSectionConfig & { isExpandable: boolean, isExpanded: boolean })[];
    }, [sectionsConfig, searchTerms, expandedSections]);

    const renderSectionHeader = ({ section }: { section: any }) => (
        <View className='bg-background pt-6 pb-3'>
            <Text className='text-base font-montserrat-bold text-text-dark'>
                {section.title}
            </Text>

            {section.searchable && (
                <View className='mt-3'>
                    <SearchBar
                        value={searchTerms[section.id] || ''}
                        onChangeText={(text) => 
                            setSearchTerms(prev => ({ ...prev, [section.id]: text }))
                        }
                        placeholder={section.placeholder || 'Buscar...'}
                    />
                </View>
            )}
        </View>
    );

    const renderItem =({ item, section }: { item: any, section: any }) => {
        if (section.type === 'single-horizontal') {
            return (
                <FlatList
                    data={item.filter((year: any) => year !== null)}
                    keyExtractor={(year) => year.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item: year }) => {
                        const isSelected = localFilters[section.id] === year;
                        const label = year.toString();

                        return (
                            <TouchableOpacity
                                onPress={() => handleFilterChange(section.id, year, section.type)}
                                activeOpacity={0.7}
                                className={`py-2 px-4 rounded-full mr-2 border ${
                                    isSelected ? 'bg-accent border-accent' : 'bg-background border-primary/40'
                                }`}
                            >
                                <Text className={`font-montserrat-medium ${
                                    isSelected ? 'text-white' : 'text-text-dark'
                                }`}>
                                    {label}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            );
        }

        if (section.type === 'star-rating') {
            const currentRating = localFilters[section.id] || 0;
            
            return (
                <View className='py-4 items-center'>
                    <StarRating 
                        rating={currentRating}
                        onRate={(rating) => handleFilterChange(section.id, rating, 'star-rating')}
                        size={36}
                    />
                </View>
            );
        }

        if (section.type === 'multi-list') {
            const value = section.getValue(item);
            const label = section.getLabel(item);
            const key = section.getKey(item);
            
            // Comprobamos el estado genérico
            const isSelected = (localFilters[section.id] || []).includes(value);

            return (
                <TouchableOpacity
                    key={key}
                    onPress={() => handleFilterChange(section.id, value, 'multi-list')}
                    activeOpacity={0.7}
                    className='flex-row items-center justify-between py-3 border-b border-primary/20'
                >
                    <Text className={`font-montserrat ${
                        isSelected ? 'text-accent font-montserrat-medium' : 'text-text-dark'
                    }`}>
                        {label}
                    </Text>
                    {isSelected && (
                        <Ionicons name="checkmark-circle" size={22} color="#E0AFA0"/>
                    )}
                </TouchableOpacity>
            );
        }

        return null;
    };

    const renderSectionFooter = ({ section }: {section: any}) => {
        if (!section.isExpandable) {
            return null;
        }

        return (
            <TouchableOpacity
                onPress={() => toggleSectionExpansion(section.id)}
                activeOpacity={0.7}
                className='py-3 items-center border-b border-primary/20'
            >
                <Text className='font-montserrat-medium text-accent'>
                    {section.isExpanded ? 'Ver menos' : 'Ver más'}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            isVisible={visible}
            onBackdropPress={onClose}
            onSwipeComplete={onClose}
            swipeDirection={['down']}
            backdropOpacity={0.5}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationInTiming={400}
            animationOutTiming={700}
            backdropTransitionInTiming={400}
            backdropTransitionOutTiming={700}
            style={{ margin: 0, justifyContent: 'flex-end' }}
            avoidKeyboard={true}
            useNativeDriver={true}
            useNativeDriverForBackdrop={true}
            propagateSwipe={true}
        >
            <View 
                className="bg-background rounded-t-3xl"
                style={{ maxHeight: '85%', minHeight: '60%' }}
            >
                <View className='w-10 h-1.5 bg-gray-300 rounded-full self-center my-3'/>
                {/* Header */}
                <View className="flex-row items-center justify-between p-4 border-b border-primary/30">
                    <Text className="text-xl font-lora text-text-dark">Filtros</Text>
                    <TouchableOpacity onPress={onClose} activeOpacity={0.6}>
                        <Ionicons name="close" size={24} color="#463F3A" />
                    </TouchableOpacity>
                </View>

                <SectionList
                    sections={sections}
                    renderItem={renderItem}
                    renderSectionHeader={renderSectionHeader}
                    renderSectionFooter={renderSectionFooter}
                    stickySectionHeadersEnabled={true}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    className='px-4'
                    contentContainerStyle={{ paddingBottom: 24 }}
                />

                {/* Footer con botones */}
                <View className="p-4 border-t border-primary/30 flex-row gap-3">
                    <TouchableOpacity
                        onPress={handleClearAll}
                        activeOpacity={0.7}
                        className="flex-1 py-3 rounded-xl border border-primary/40 items-center"
                    >
                        <Text className="font-montserrat-medium text-text-dark">
                            Limpiar
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleApply}
                        activeOpacity={0.7}
                        className="flex-1 py-3 rounded-xl bg-accent items-center"
                    >
                        <Text className="font-montserrat-medium text-white">
                            Aplicar {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default FilterModal;
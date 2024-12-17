export type ThemeTypes = {
    name: string;
    dark: boolean;
    variables?: object;
    colors: {
        [key: string]: string | undefined;
        primary_1?: string;
        primary_2?: string;
        primary_3?: string;
        primary_4?: string;
        secondary_1?: string;
        secondary_2?: string;
        secondary_3?: string;
        info?: string;
        success?: string;
        warning?: string;
        error?: string;
        background_success?: string;
        background_warning?: string;
        background_error?: string;
        background_info?: string;
        text_primary?: string;
        text_placeholder?: string;
        stroke?: string;
        disable?: string
    };
};

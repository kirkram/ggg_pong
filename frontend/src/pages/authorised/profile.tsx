import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { AxiosError } from "axios";
import { useNavigate } from 'react-router-dom';
import { appRegister } from "../../service";
import { ProfileData, UpdateProfileField, ProfileProps } from "../../service/interface"

// export const Profile: React.FC<ProfileProps> = 